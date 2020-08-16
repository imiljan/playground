import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import ms from 'ms';

import { ConfigService } from '../shared/config/config.service';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetUser } from './jwt/user.decorator';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  @Post('/register')
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    this.setCookie(res, refreshToken);
    res.send({ accessToken });
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService
      .refresh(req.cookies.xyz)
      .catch((err) => {
        res.clearCookie('xyz', { path: `/auth` });
        throw err;
      });

    this.setCookie(res, refreshToken);
    res.send({ accessToken });
  }

  @Post('/logout')
  @UseGuards(AuthGuard())
  logout(@Req() req: Request, @Res() res: Response) {
    this.authService
      .logout(req.cookies.xyz)
      .catch((e) => this.logger.error('User logout error: ' + e));

    res.clearCookie('xyz');
    res.end();
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  me(@GetUser() user: UserEntity) {
    delete user.password;
    delete user.tokenVersion;
    return user;
  }

  @Post('/forgot-password')
  forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('/reset-password')
  resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Helper functions

  /**
   * Sets refreshToken in cookie
   * @param res Response object
   * @param refreshToken refresh token
   */
  private setCookie(res: Response, refreshToken: string) {
    res.cookie('xyz', refreshToken, {
      expires: new Date(Date.now() + ms(this.config.jwt.refreshExpiresIn)),
      path: `/auth`,
      maxAge: ms(this.config.jwt.refreshExpiresIn),
    });
  }
}

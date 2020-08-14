import ms from 'ms';
import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ConfigService } from '../shared/config/config.service';


@Controller('auth')
export class AuthController {
  // private logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService,
              private readonly config: ConfigService) {
  }

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

  // Helper functions

  /**
   * Sets refreshToken in cookie
   * @param res Response object
   * @param refreshToken refresh token
   */
  private setCookie(res: Response, refreshToken: string) {
    res.cookie('rit', refreshToken, {
      expires: new Date(Date.now() + ms(this.config.jwt.refreshExpiresIn)),
      path: `/auth`,
    });
  }
}

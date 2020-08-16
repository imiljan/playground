import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash as hashPassword, verify as verifyPassword } from 'argon2';
import ms from 'ms';
import { Connection } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { ConfigService } from '../shared/config/config.service';
import { UserEntity } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AccessTokenPayload, RefreshTokenPayload } from './jwt/jwt-payload.interface';
import { ForgotPasswordEntity } from './password/forgot-password.entity';
import { ForgotPasswordRepository } from './password/forgot-password.repository';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(ForgotPasswordRepository)
    private readonly forgotPasswordRepository: ForgotPasswordRepository,
    private readonly connection: Connection,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserEntity> {
    const { email, password, fullName } = registerDto;

    if ((await this.userRepository.count({ email })) > 0) {
      throw new ConflictException('Email in use!');
    }

    const name = fullName.replace(
      /\w\S*/g,
      (c) => c.charAt(0).toUpperCase() + c.substr(1).toLowerCase(),
    );

    const hashedPassword = await hashPassword(password);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName: name,
    });

    const u = await this.userRepository.save(user);
    delete user.password;

    return u;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['id', 'email', 'password', 'tokenVersion'] },
    );

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Wrong credentials!');
    }

    return this.generateTokens(user);
  }

  async refresh(token: string) {
    try {
      const { id, tokenVersion }: RefreshTokenPayload = await this.jwtService.verifyAsync(token);

      const user = await this.userRepository.findOne(id, {
        select: ['id', 'email', 'tokenVersion'],
      });

      if (!user || user.tokenVersion != tokenVersion) {
        throw new UnauthorizedException('Session expired!');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async logout(token: string) {
    const { id }: RefreshTokenPayload = await this.jwtService
      .verifyAsync(token)
      .catch((err) => this.logger.error(err));
    await this.userRepository.increment({ id }, 'tokenVersion', 1);
  }

  async forgotPassword(email: string) {
    if ((await this.userRepository.count({ email })) === 0) {
      throw new NotFoundException('Email not found');
    }

    const code = Math.floor(Math.random() * 100000);
    const expiresAt = new Date(Date.now() + ms('15m'));

    await this.forgotPasswordRepository.save({
      email,
      code,
      expiresAt,
    });

    this.mailService.sendForgotPasswordEmail(email, code);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { password, code, email } = resetPasswordDto;

    const forgotPassword = await this.forgotPasswordRepository.findOne({ where: { email, code } });

    if (!forgotPassword) {
      throw new NotFoundException('Request for change password not found!');
    }

    if (forgotPassword.expiresAt.getTime() < Date.now()) {
      this.forgotPasswordRepository
        .delete({ email: forgotPassword.email })
        .catch((err) => this.logger.error(err));
      throw new GoneException('Request for change password expired!');
    }

    const hashedPassword = await hashPassword(password);

    await this.connection
      .transaction(async (manager) => {
        await manager.update(UserEntity, { email }, { password: hashedPassword });
        await manager.delete(ForgotPasswordEntity, { email: forgotPassword.email });
      })
      .catch((e) => this.logger.error('Reset password failed\n' + e));
  }

  // Private functions
  /**
   *
   * @param user User must have id, email and tokenVersion
   */
  private async generateTokens(user: UserEntity) {
    const payload: AccessTokenPayload = { id: user.id, email: user.email };

    // TODO: userId in jwt subject?
    const accessToken = await this.jwtService.signAsync(payload);

    // ? Check if there is a way to use different secret for signing
    const { refreshExpiresIn } = this.config.jwt;
    const refreshTokenPayload: RefreshTokenPayload = {
      id: user.id,
      tokenVersion: user.tokenVersion,
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

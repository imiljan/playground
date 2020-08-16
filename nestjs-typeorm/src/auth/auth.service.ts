import {
  ConflictException,
  GoneException,
  Injectable,
  InternalServerErrorException,
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
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenPayload } from './jwt/jwt.interface';
import { ForgotPasswordEntity } from './password/forgot-password.entity';
import { ForgotPasswordRepository } from './password/forgot-password.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
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
      { select: ['id', 'email', 'password', 'role'] },
    );

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Wrong credentials!');
    }

    return this.generateTokens(user, true);
  }

  async refresh(token: string) {
    try {
      const { sub: id, exp }: RefreshTokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.jwt.refreshSecret,
      });

      const user = await this.userRepository.findOne(id, {
        select: ['id', 'email', 'role'],
        relations: ['tokens'],
      });

      const isValid = user?.tokens.find((t) => t.token === token)?.isValid;

      if (!user || !isValid) {
        throw new UnauthorizedException('Session expired!');
      }

      const timeDif = new Date(exp * 1000).getTime() - new Date().getTime();
      const acceptingDif = ms('24h');
      const generateRefresh = timeDif <= acceptingDif;

      return this.generateTokens(user, generateRefresh);
    } catch (error) {
      throw new UnauthorizedException('Session expired');
    }
  }

  async logout(token: string) {
    try {
      const { sub: id }: RefreshTokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.jwt.refreshSecret,
      });

      const refreshToken = await this.authRepository.findOne({
        where: { token, user: { id } },
        relations: ['user'],
      });

      if (refreshToken) {
        refreshToken.isValid = false;
        await this.authRepository.save(refreshToken);
      }
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
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
   * @param user User must have id, email and role
   */
  private async generateTokens(user: UserEntity, generateRefresh: boolean) {
    const { id: subject, email, role } = user;

    const accessToken = await this.jwtService.signAsync({ email, role }, { subject });

    let refreshToken = '';
    if (generateRefresh) {
      refreshToken = await this.jwtService.signAsync(
        {},
        {
          subject,
          expiresIn: this.config.jwt.refreshExpiresIn,
          secret: this.config.jwt.refreshSecret,
        },
      );

      await this.authRepository.save({
        user,
        token: refreshToken,
        expiresAt: new Date(Date.now() + ms(this.config.jwt.refreshExpiresIn)),
      });
    }

    return { accessToken, refreshToken };
  }
}

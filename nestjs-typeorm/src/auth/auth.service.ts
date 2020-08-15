import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash as hashPassword, verify as verifyPassword } from 'argon2';

import { ConfigService } from '../shared/config/config.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JWTPayload } from './jwt/jwt-payload.interface';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

interface RefreshTokenPayload {
  id: number;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

  // Private functions
  /**
   *
   * @param user User must have id, email and tokenVersion
   */
  private async generateTokens(user: UserEntity) {
    const payload: JWTPayload = { id: user.id, email: user.email };

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

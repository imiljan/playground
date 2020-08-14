import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '../../shared/config/config.service';
import { UserRepository } from '../user.repository';
import { JWTPayload } from './jwt-payload.interface';
import { UserEntity } from '../user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || config.jwt.secret,
    });
  }

  async validate(payload: JWTPayload): Promise<UserEntity> {
    const { email } = payload;
    const user = await this.userRepository.findOne(
      { email },
      {
        select: [
          'id',
          'email',
          'password',
          'fullName',
          'createdAt',
          'updatedAt',
          'role',
          'tokenVersion'
        ],
      },
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

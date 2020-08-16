import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '../../shared/config/config.service';
import { UserRole } from '../../user/user.entity';
import { AccessTokenPayload, JWTUser } from './jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || config.jwt.secret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<JWTUser> {
    const { email, sub, role } = payload;

    // Or check in db if user is still active or something similar
    if (!email) {
      throw new UnauthorizedException();
    }

    const user: JWTUser = {
      id: parseInt(sub),
      email,
      role: role || UserRole.GUEST,
    };

    return user;
  }
}

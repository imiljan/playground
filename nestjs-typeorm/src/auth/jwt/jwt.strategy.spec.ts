import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ConfigService } from '../../shared/config/config.service';
import { UserRole } from '../../user/user.entity';
import { JWTUser } from './jwt.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useFactory: () => ({
            jwt: { secret: 'testsecret' },
          }),
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('validates and returns the user based on JWT payload', async () => {
      const mockUser: JWTUser = {
        id: 1,
        email: 'test@test.com',
        role: UserRole.USER,
      };
      mockUser.id = 1;
      mockUser.email = 'test@test.com';
      const result = await jwtStrategy.validate({
        sub: '1',
        email: 'test@test.com',
        role: UserRole.USER,
        exp: 123123123,
        iat: 123123123,
      });

      expect(result).toEqual(mockUser);
    });

    it('throws an unauthorized exception as user cannot be found', () => {
      expect(
        jwtStrategy.validate({
          sub: '0',
          role: UserRole.GUEST,
          exp: 123123123,
          iat: 123123123,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ConfigService } from '../../shared/config/config.service';
import { UserEntity } from '../user.entity';
import { UserRepository } from '../user.repository';
import { JwtStrategy } from './jwt.strategy';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            jwt: { secret: 'testsecret' },
          }),
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates and returns the user based on JWT payload', async () => {
      const mockUser = new UserEntity();
      mockUser.id = 1;
      mockUser.email = 'test@test.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await jwtStrategy.validate({ id: 1, email: 'test@test.com' });
      expect(userRepository.findOne).toHaveBeenCalledWith(
        { email: 'test@test.com' },
        {
          select: [
            'id',
            'email',
            'password',
            'fullName',
            'createdAt',
            'updatedAt',
            'role',
            'tokenVersion',
          ],
        },
      );
      expect(result).toEqual(mockUser);
    });

    it('throws an unauthorized exception as user cannot be found', () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      expect(jwtStrategy.validate({ id: 0, email: 'test@test.com' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

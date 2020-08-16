import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '../shared/config/config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            login: jest.fn(),
            register: jest.fn(),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            jwt: { refreshExpiresIn: 36000 },
          }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

// TODO!

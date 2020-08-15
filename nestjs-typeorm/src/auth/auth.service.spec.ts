import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { ConfigService } from '../shared/config/config.service';
import { AuthService } from './auth.service';
import { ForgotPasswordRepository } from './password/forgot-password.repository';
import { UserRepository } from './user.repository';

const mockUserRepository = () => ({
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  increment: jest.fn(),
});

const mockForgotPasswordRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: ForgotPasswordRepository, useFactory: mockForgotPasswordRepository },
        {
          provide: Connection,
          useValue: {
            transaction: jest.fn(),
          },
        },
        { provide: JwtService, useFactory: mockJwtService },
        {
          provide: ConfigService,
          useFactory: () => ({
            jwt: { refreshExpiresIn: 36000 },
          }),
        },
        {
          provide: MailService,
          useValue: { sendForgotPasswordEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// TODO!

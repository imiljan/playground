import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../mail/mail.module';
import { configServiceInstance } from '../shared/config/config.service';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ForgotPasswordRepository } from './password/forgot-password.repository';
import { RolesGuard } from './roles/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, ForgotPasswordRepository]),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || configServiceInstance.jwt.secret,
      signOptions: {
        expiresIn: configServiceInstance.jwt.expiresIn,
      },
    }),
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}

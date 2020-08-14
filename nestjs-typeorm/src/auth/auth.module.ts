import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { RolesGuard } from './roles/roles.guard';
import { configServiceInstance } from '../shared/config/config.service';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    SharedModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || configServiceInstance.jwt.secret,
      signOptions: {
        expiresIn: configServiceInstance.jwt.expiresIn,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, AuthService],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy],

})
export class AuthModule {}

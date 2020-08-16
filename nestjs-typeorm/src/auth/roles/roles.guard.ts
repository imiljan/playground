import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../user/user.entity';
import { JWTUser } from '../jwt/jwt.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: JWTUser = request.user;

    if (!user) {
      this.logger.error('No user on request');
      return false;
    }

    return roles.includes(UserRole[user.role as keyof typeof UserRole]);
  }
}

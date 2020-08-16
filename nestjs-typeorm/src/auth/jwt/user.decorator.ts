import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserEntity } from '../../user/user.entity';

export const GetUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserEntity => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);

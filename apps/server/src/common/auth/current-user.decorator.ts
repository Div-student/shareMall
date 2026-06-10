import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { JwtPayload } from './jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const user = req.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { AdminJwtPayload } from './admin-auth.guard';

export const CurrentAdmin = createParamDecorator(
  (data: keyof AdminJwtPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { admin?: AdminJwtPayload }>();
    const admin = req.admin;
    if (!admin) return undefined;
    return data ? admin[data] : admin;
  },
);

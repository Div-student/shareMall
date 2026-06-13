import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { hasPermission, isPublicAdminPath, normalizeAdminPath, resolveAdminPermission } from './admin.constants';

export interface AdminJwtPayload {
  sub: string;
  username: string;
  roleId?: string;
  permissions: string[];
  type: 'admin';
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { admin?: AdminJwtPayload }>();
    const path = normalizeAdminPath(req.path);
    if (!path.startsWith('/api/admin')) return true;
    if (isPublicAdminPath(path)) return true;

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('请先登录后台');
    }

    try {
      const payload = await this.jwt.verifyAsync<AdminJwtPayload>(auth.slice(7));
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的后台凭证');
      }

      const required = resolveAdminPermission(path);
      if (required && !hasPermission(payload.permissions, required)) {
        throw new ForbiddenException('无权限访问');
      }

      req.admin = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('登录已过期');
    }
  }
}

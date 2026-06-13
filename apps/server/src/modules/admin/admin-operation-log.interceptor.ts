import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import type { AdminJwtPayload } from './admin-auth.guard';
import { normalizeAdminPath } from './admin.constants';
import { OperationLogService } from './operation-log.service';

@Injectable()
export class AdminOperationLogInterceptor implements NestInterceptor {
  constructor(private readonly operationLog: OperationLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<
      Request & { admin?: AdminJwtPayload; body?: Record<string, unknown> }
    >();

    if (!this.shouldLog(req)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.operationLog.write({
          adminId: req.admin!.sub,
          module: this.resolveModule(req.path),
          action: req.method.toLowerCase(),
          detail: {
            path: req.path,
            body: this.sanitizeBody(req.body),
          },
          ip: req.ip,
        });
      }),
    );
  }

  private shouldLog(req: Request & { admin?: AdminJwtPayload }) {
    if (!req.admin) return false;
    const path = normalizeAdminPath(req.path);
    if (!path.startsWith('/api/admin')) return false;
    if (path.startsWith('/api/admin/auth')) return false;
    if (path.startsWith('/api/admin/logs')) return false;
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  }

  private resolveModule(path: string) {
    const normalized = normalizeAdminPath(path);
    const segments = normalized.replace('/api/admin/', '').split('/');
    return segments[0] || 'admin';
  }

  private sanitizeBody(body?: Record<string, unknown>) {
    if (!body || typeof body !== 'object') return undefined;
    const cloned = { ...body };
    for (const key of ['password', 'newPassword', 'passwordHash']) {
      if (key in cloned) cloned[key] = '***';
    }
    return cloned;
  }
}

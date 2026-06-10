import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/** 统一异常输出：{ code, message, data } */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message as string) ?? exception.message;
      if (Array.isArray(message)) message = message.join(', ');
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}

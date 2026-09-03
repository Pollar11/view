import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Uniform error envelope. Crucially, unexpected errors are logged server-side
 * but the response body is generic — a stack trace or upstream error string
 * could contain a source hostname.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      res.status(status).json(
        typeof payload === 'string'
          ? { statusCode: status, message: payload }
          : payload,
      );
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Something went wrong. Please try again.',
      error: 'Internal Server Error',
    });
  }
}

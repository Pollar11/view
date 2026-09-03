import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

/** Guards operator-only endpoints with the ADMIN_TOKEN env var (x-admin-token header). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN?.trim();
    if (!expected || expected.length < 8) {
      throw new ForbiddenException('Admin endpoints are disabled (set ADMIN_TOKEN).');
    }
    const provided = String(
      context.switchToHttp().getRequest().headers['x-admin-token'] ?? '',
    );
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('Invalid admin token.');
    }
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthUser } from './jwt.strategy';

/** Rejects the request with 401 unless a valid access token is present. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * Populates `req.user` when a valid token is present but never rejects.
 * Used by endpoints that personalise output for logged-in users but still
 * work anonymously (home feed, item detail, listings).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  handleRequest<TUser = AuthUser>(_err: unknown, user: TUser): TUser {
    return (user || undefined) as TUser;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      /* ignore — anonymous is allowed */
    }
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    return ctx.switchToHttp().getRequest().user;
  },
);

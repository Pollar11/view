import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../common/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (payload.type !== 'access') throw new UnauthorizedException('Wrong token type');
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Account no longer exists');
    return { id: user.id, email: user.email, displayName: user.displayName };
  }
}

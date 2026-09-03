import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthResponse, PublicUser } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { ttlToSeconds } from '../config/configuration';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { toPublicUser } from '../users/user.mapper';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with that email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, displayName: dto.displayName },
    });
    return this.issue(toPublicUser(user));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Constant-ish work factor whether or not the user exists.
    const hash = user?.passwordHash ?? '$2a$12$0000000000000000000000000000000000000000000000000000';
    const ok = await bcrypt.compare(dto.password, hash);
    if (!user || !ok) throw new UnauthorizedException('Invalid email or password.');
    return this.issue(toPublicUser(user));
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: { sub: string; jti: string; type: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session.');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Wrong token type.');

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
      // Re-use of a revoked token → nuke every session for that user.
      if (stored?.userId) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Session expired. Please sign in again.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    return this.issue(toPublicUser(user));
  }

  async logout(refreshToken: string | undefined, userId: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), userId },
        data: { revokedAt: new Date() },
      });
      return;
    }
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issue(user: PublicUser): Promise<AuthResponse> {
    const accessTtl = this.config.get<string>('jwt.accessTtl')!;
    const refreshTtl = this.config.get<string>('jwt.refreshTtl')!;
    const jti = randomBytes(16).toString('hex');

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, type: 'access', jti: randomBytes(8).toString('hex') },
      { secret: this.config.get<string>('jwt.accessSecret'), expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti, type: 'refresh' },
      { secret: this.config.get<string>('jwt.refreshSecret'), expiresIn: refreshTtl },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + ttlToSeconds(refreshTtl) * 1000),
      },
    });
    // Opportunistic cleanup of expired rows.
    void this.prisma.refreshToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => undefined);

    return {
      user,
      tokens: { accessToken, refreshToken, expiresIn: ttlToSeconds(accessTtl) },
    };
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signs outbound poster URLs so the frontend only ever sees an opaque, same-
 * origin path (`/media/<payload>.<sig>`). The real upstream image host is never
 * disclosed, and the signature prevents the endpoint being used as an open
 * image proxy / SSRF vector.
 */
@Injectable()
export class MediaService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret =
      config.get<string>('jwt.accessSecret') + ':media' || 'dev-media-secret';
  }

  sign(rawUrl: string | null | undefined): string | null {
    if (!rawUrl) return null;
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return null;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const payload = Buffer.from(parsed.toString()).toString('base64url');
    return `/media/${payload}.${this.hmac(payload)}`;
  }

  resolve(payload: string, sig: string): string {
    const expected = this.hmac(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new BadRequestException('Bad media signature');
    }
    let url: string;
    try {
      url = Buffer.from(payload, 'base64url').toString('utf8');
      const parsed = new URL(url);
      if (isPrivateHost(parsed.hostname)) throw new Error('blocked host');
    } catch {
      throw new BadRequestException('Bad media reference');
    }
    return url;
  }

  private hmac(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url').slice(0, 24);
  }
}

function isPrivateHost(host: string): boolean {
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (/^(?:127\.|10\.|192\.168\.|169\.254\.|::1|fc00:|fe80:)/i.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

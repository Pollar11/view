import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MediaService } from './media.service';

/**
 * Opaque image proxy. Streams the upstream poster through our own origin with a
 * long cache lifetime, stripping any set-cookie / tracking headers.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(':ref')
  @Header('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable')
  async proxy(@Param('ref') ref: string, @Res() res: Response): Promise<void> {
    const dot = ref.lastIndexOf('.');
    if (dot < 1) {
      res.status(400).end();
      return;
    }
    const url = this.media.resolve(ref.slice(0, dot), ref.slice(dot + 1));

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const upstream = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ViewMediaProxy/1.0', Accept: 'image/*' },
      });
      clearTimeout(timer);

      const type = upstream.headers.get('content-type') ?? '';
      if (!upstream.ok || !type.startsWith('image/')) {
        res.status(404).end();
        return;
      }
      res.setHeader('Content-Type', type);
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    } catch {
      res.status(502).end();
    }
  }
}

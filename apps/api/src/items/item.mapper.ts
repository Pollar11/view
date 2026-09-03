import type { Item as PrismaItem } from '@prisma/client';
import type { Category, Item } from '@view/shared';
import type { MediaService } from '../media/media.service';

/**
 * The ONLY place a DB row becomes a client-facing item. `sourceId`,
 * `sourceKind`, `externalId` and `sourcePageUrl` are structurally dropped here —
 * they never appear in any response body. The poster URL is rewritten to an
 * opaque, same-origin `/media/...` path so the upstream image host never leaks.
 */
export function toItemDto(row: PrismaItem, media?: MediaService): Item {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category as Category,
    genres: safeParseArray(row.genresJson),
    year: row.year ?? null,
    tags: safeParseArray(row.tagsJson),
    rating: row.rating ?? null,
    posterUrl: media ? media.sign(row.posterUrl) : row.posterUrl ?? null,
    releasedAt: row.releasedAt ? row.releasedAt.toISOString() : null,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    popularity: round(row.popularity),
  };
}

function safeParseArray(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

import type { Category } from '@view/shared';
import { isCategory } from '@view/shared';
import type { RawItem } from './types';

const CATEGORY_ALIASES: Record<string, Category> = {
  movie: 'movies',
  movies: 'movies',
  film: 'movies',
  films: 'movies',
  cinema: 'movies',
  sport: 'sports',
  sports: 'sports',
  match: 'sports',
  matches: 'sports',
  fixture: 'sports',
  game: 'sports',
  live: 'sports',
  doc: 'documentaries',
  docs: 'documentaries',
  documentary: 'documentaries',
  documentaries: 'documentaries',
  'documentary-film': 'documentaries',
};

export function coerceCategory(value: unknown, fallback: Category): Category {
  if (isCategory(value)) return value;
  const key = String(value ?? '').trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? fallback;
}

export function coerceYear(value: unknown): number | null {
  if (typeof value === 'number' && value > 1870 && value < 2100) return Math.floor(value);
  const m = /(\d{4})/.exec(String(value ?? ''));
  if (!m) return null;
  const y = Number(m[1]);
  return y > 1870 && y < 2100 ? y : null;
}

export function coerceRating(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  // Normalise 0–100 or 0–10 scales to 0–10.
  if (n > 10 && n <= 100) return Math.round((n / 10) * 10) / 10;
  if (n >= 0 && n <= 10) return Math.round(n * 10) / 10;
  return null;
}

export function coerceDate(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v : typeof v === 'object' && v && 'name' in v ? String((v as { name: unknown }).name) : '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[,|/]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function pick<T = unknown>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return obj[k] as T;
  }
  return undefined;
}

/** True when a raw item has enough signal to be worth storing. */
export function isUsable(item: Partial<RawItem>): item is RawItem {
  return Boolean(item.externalId && item.title && item.title.length >= 2 && item.sourcePageUrl && item.category);
}

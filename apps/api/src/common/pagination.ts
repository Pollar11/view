import type { Paginated } from '@view/shared';

export function clampPage(page?: number): number {
  const n = Math.floor(Number(page) || 1);
  return n < 1 ? 1 : n;
}

export function clampLimit(limit?: number, max = 50, fallback = 20): number {
  const n = Math.floor(Number(limit) || fallback);
  if (n < 1) return fallback;
  return n > max ? max : n;
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
  };
}

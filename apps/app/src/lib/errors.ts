import type { ApiError } from '@view/shared';

/** Turns an RTK Query error into a single human string. */
export function errMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (!err) return fallback;
  const e = err as { data?: ApiError; error?: string; status?: number | string };
  if (e.data?.message) {
    return Array.isArray(e.data.message) ? e.data.message[0] : e.data.message;
  }
  if (e.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your connection.';
  if (typeof e.error === 'string') return e.error;
  return fallback;
}

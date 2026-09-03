/**
 * Process-local micro-cache. Reads are a `Map.get` — nanoseconds — so repeated
 * requests within the TTL never touch the upstream API or even re-parse JSON.
 * This sits in front of every provider call (see src/lib/content/cached.ts).
 *
 * It is per-instance and non-persistent by design: it cannot go stale across a
 * deploy, and each serverless instance warms itself in one request. Cross-edge
 * caching is handled separately by the `Cache-Control` headers on /api routes.
 */
type Entry<T> = { value: T; expires: number; stale: number };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const MAX_ENTRIES = 500;

export type CacheOpts = {
  /** Serve from cache for this many ms (default 15_000). */
  ttlMs?: number;
  /** Keep serving the stale value while refreshing, up to this many ms more. */
  staleMs?: number;
};

export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  { ttlMs = 15_000, staleMs = 60_000 }: CacheOpts = {},
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;

  if (hit && now < hit.expires) return hit.value;

  // stale-while-revalidate: return stale immediately, refresh in background
  if (hit && now < hit.stale) {
    if (!inflight.has(key)) {
      inflight.set(
        key,
        loader()
          .then((value) => set(key, value, ttlMs, staleMs))
          .catch(() => {})
          .finally(() => inflight.delete(key)),
      );
    }
    return hit.value;
  }

  // cold (or fully expired): dedupe concurrent loaders
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = loader()
    .then((value) => {
      set(key, value, ttlMs, staleMs);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

function set<T>(key: string, value: T, ttlMs: number, staleMs: number): T {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.delete(key);
  store.set(key, {
    value,
    expires: Date.now() + ttlMs,
    stale: Date.now() + ttlMs + staleMs,
  });
  return value;
}

export function invalidate(prefix?: string) {
  if (!prefix) return store.clear();
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}

export function cacheStats() {
  return { entries: store.size, inflight: inflight.size };
}

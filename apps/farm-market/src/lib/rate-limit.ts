/**
 * Simple in-memory sliding-window rate limiter, per client IP + route key.
 *
 * Honest limitation: this resets on process restart and is per-instance,
 * not shared across multiple serverless replicas. For a low-traffic demo
 * storefront that's an acceptable trade-off against added infra (e.g.
 * Redis); swap in a shared store if this ever runs multi-instance at scale.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __farmMarketRateLimit: Map<string, Bucket> | undefined;
}

function store(): Map<string, Bucket> {
  if (!global.__farmMarketRateLimit) {
    global.__farmMarketRateLimit = new Map();
  }
  return global.__farmMarketRateLimit;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Returns true if the request is allowed, false if it should be rejected. */
export function rateLimit(
  req: Request,
  routeKey: string,
  opts: { limit: number; windowMs: number },
): boolean {
  const key = `${routeKey}:${clientIp(req)}`;
  const now = Date.now();
  const buckets = store();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }
  if (existing.count >= opts.limit) {
    console.warn(`[security] rate limit hit: ${key}`);
    return false;
  }
  existing.count += 1;
  return true;
}

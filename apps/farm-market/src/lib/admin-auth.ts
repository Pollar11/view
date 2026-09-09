import crypto from "node:crypto";

const COOKIE_NAME = "farm_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Admin is fail-closed in production: without a real ADMIN_PASSWORD_HASH and
 * ADMIN_SESSION_SECRET set, every admin login and every session check
 * refuses outright rather than falling back to a value baked into the
 * source (which anyone with read access to this repo — or a leaked
 * checkout of it — would know). Dev mode keeps a friendly fallback so
 * `npm run dev` works with no setup.
 */
export function isAdminConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.ADMIN_PASSWORD_HASH) && Boolean(process.env.ADMIN_SESSION_SECRET);
}

const SCRYPT_KEY_LENGTH = 64;

/**
 * The admin password itself is never stored, in an env var or anywhere
 * else — only a salted scrypt hash of it (ADMIN_PASSWORD_HASH, generated
 * by scripts/hash-admin-password.mjs), in "<saltHex>:<hashHex>" form. A
 * leaked env var listing then reveals nothing usable without redoing the
 * (deliberately slow) hash computation for every guess.
 */
function verifyAgainstHash(candidate: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const candidateHash = crypto.scryptSync(candidate, salt, SCRYPT_KEY_LENGTH);
    const storedHash = Buffer.from(hash, "hex");
    if (candidateHash.length !== storedHash.length) return false;
    return crypto.timingSafeEqual(candidateHash, storedHash);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(candidate: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored) return verifyAgainstHash(candidate, stored);
  // No hash configured — only ever reachable in dev (isAdminConfigured()
  // gates production before this is called), so a plain fallback is fine.
  return candidate === (process.env.ADMIN_PASSWORD || "farm2026");
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return "dev-only-insecure-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken(): string {
  if (!isAdminConfigured()) {
    throw new Error("Admin is not configured (ADMIN_PASSWORD_HASH/ADMIN_SESSION_SECRET unset)");
  }
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  if (!isAdminConfigured()) return false;
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
    const expires = parseInt(payload, 10);
    return Number.isFinite(expires) && expires > Date.now();
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

/** Raw session-cookie token off an incoming Request, or null if absent. */
export function getAdminToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

/** Reads the admin session cookie straight off an incoming Request — usable
 * inside Route Handlers without pulling in next/headers. */
export function isAdminRequest(req: Request): boolean {
  return verifyAdminToken(getAdminToken(req));
}

/**
 * CSRF token for state-changing admin actions (e.g. the win-back SMS
 * blast), double-submit style: derived from the session cookie's own
 * value via HMAC, handed to the client once (login response / session
 * check), and required back as a header on the state-changing request.
 * A cross-site page can make the browser attach the httpOnly session
 * cookie automatically, but it can't read this token to forge the header.
 */
export function createCsrfToken(sessionToken: string): string {
  return crypto.createHmac("sha256", secret()).update(`csrf:${sessionToken}`).digest("hex");
}

export function verifyCsrfToken(sessionToken: string | null, candidate: string | null): boolean {
  if (!sessionToken || !candidate) return false;
  const expected = createCsrfToken(sessionToken);
  const candidateBuf = Buffer.from(candidate);
  const expectedBuf = Buffer.from(expected);
  if (candidateBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(candidateBuf, expectedBuf);
}

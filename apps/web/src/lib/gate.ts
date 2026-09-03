/**
 * Site gate — a username/password wall in front of the whole app.
 * Stateless signed-cookie session so it works on edge middleware and
 * across serverless instances with no shared store.
 *
 * Credentials and secret come from env; the defaults match what was asked
 * for "for the time being" — change them in production.
 */
export const GATE_COOKIE = "view_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export const MAX_ATTEMPTS = 3;
export const LOCKOUT_MS = 2 * 60 * 1000;

export function gateUser(): string {
  return process.env.SITE_USER || "admin26";
}
export function gatePassword(): string {
  return process.env.SITE_PASSWORD || "admin2026&";
}
function secret(): string {
  return process.env.AUTH_SECRET || `view::${gateUser()}::${gatePassword()}`;
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToStr(s: string): string {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(new Uint8Array(sig));
}

/** Create a session token for a user, valid for SESSION_TTL_SECONDS. */
export async function createSession(user: string): Promise<string> {
  const payload = b64url(
    enc.encode(
      JSON.stringify({ u: user, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
    ),
  );
  return `${payload}.${await sign(payload)}`;
}

/** Verify a session token; returns the username or null. */
export async function verifySession(token?: string | null): Promise<string | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  if ((await sign(payload)) !== mac) return null;
  try {
    const { u, exp } = JSON.parse(b64urlToStr(payload)) as {
      u: string;
      exp: number;
    };
    if (!u || typeof exp !== "number" || Date.now() > exp) return null;
    return u;
  } catch {
    return null;
  }
}

/** Constant-time-ish credential check. */
export function checkCredentials(user: string, pass: string): boolean {
  const okUser = timingSafeEqual(user, gateUser());
  const okPass = timingSafeEqual(pass, gatePassword());
  return okUser && okPass;
}

function timingSafeEqual(a: string, b: string): boolean {
  const la = enc.encode(a);
  const lb = enc.encode(b);
  let diff = la.length ^ lb.length;
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    diff |= (la[i] ?? 0) ^ (lb[i] ?? 0);
  }
  return diff === 0;
}

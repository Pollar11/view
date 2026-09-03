import { NextRequest, NextResponse } from "next/server";
import {
  GATE_COOKIE,
  SESSION_TTL_SECONDS,
  MAX_ATTEMPTS,
  LOCKOUT_MS,
  checkCredentials,
  createSession,
} from "@/lib/gate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Per-IP attempt tracker. In-memory: resets on redeploy / per serverless
 * instance, which is acceptable for a "for the time being" gate. Swap for a
 * shared store (KV) if you need strict enforcement.
 */
const attempts = new Map<string, { fails: number; lockedUntil: number }>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = attempts.get(ip) ?? { fails: 0, lockedUntil: 0 };

  if (rec.lockedUntil > now) {
    const retryAfter = Math.ceil((rec.lockedUntil - now) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Try again later.", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const { username, password } = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  if (!username || !password || !checkCredentials(username, password)) {
    rec.fails += 1;
    let retryAfter = 0;
    if (rec.fails >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
      rec.fails = 0;
      retryAfter = Math.ceil(LOCKOUT_MS / 1000);
    }
    attempts.set(ip, rec);
    await new Promise((r) => setTimeout(r, 350)); // slow down guessing
    return NextResponse.json(
      {
        error: "Invalid username or password.",
        attemptsLeft: retryAfter ? 0 : MAX_ATTEMPTS - rec.fails,
        ...(retryAfter ? { retryAfter } : {}),
      },
      { status: retryAfter ? 429 : 401 },
    );
  }

  attempts.delete(ip);

  const token = await createSession(username);
  const https =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

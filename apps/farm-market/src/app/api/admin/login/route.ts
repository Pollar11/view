import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  createCsrfToken,
} from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

const DEFAULT_DEMO_PASSWORD = "farm2026";

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // still run a comparison of equal length to avoid an obvious timing gap
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  if (!rateLimit(req, "admin-login", { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes." },
      { status: 429 },
    );
  }

  const body = (await readBoundedJson(req, 2 * 1024)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_DEMO_PASSWORD;

  if (!timingSafeStringEqual(password, expected)) {
    console.warn(`[security] failed admin login from ${clientIp(req)}`);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = createAdminToken();
  const res = NextResponse.json({ ok: true, csrfToken: createCsrfToken(token) });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}

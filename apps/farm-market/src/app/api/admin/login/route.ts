import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  createCsrfToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

export async function POST(req: Request) {
  if (!rateLimit(req, "admin-login", { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes." },
      { status: 429 },
    );
  }

  if (!isAdminConfigured()) {
    console.error(
      "[security] admin login blocked — set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET in this deployment's environment variables (run scripts/hash-admin-password.mjs to generate the hash)",
    );
    return NextResponse.json(
      { error: "Admin access isn't configured on this deployment yet." },
      { status: 503 },
    );
  }

  const body = (await readBoundedJson(req, 2 * 1024)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
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

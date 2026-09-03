import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN is not set" },
      { status: 503 },
    );
  }
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token || token !== process.env.ADMIN_TOKEN) {
    // constant-ish delay to blunt guessing
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const https =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, verifySession } from "@/lib/gate";

/**
 * Gate every route behind the login wall. Anything not explicitly public and
 * without a valid session cookie is redirected to /login.
 */
const PUBLIC_PREFIXES = ["/login", "/api/auth/"];
const PUBLIC_FILES = new Set([
  "/favicon.ico",
  "/icon.svg",
  "/mark.svg",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/og.png",
  "/robots.txt",
  "/BRANDING.md",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    PUBLIC_FILES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const user = await verifySession(req.cookies.get(GATE_COOKIE)?.value);
  if (user) return NextResponse.next();

  // API calls get a 401; everything else redirects to the login page.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { clientIp } from "@/lib/rate-limit";

/**
 * Optional extra layer in front of /admin: if ADMIN_IP_ALLOWLIST is set
 * (comma-separated IPs), only those IPs can reach /admin or /api/admin/* at
 * all — everyone else gets a flat 403 before the request reaches any admin
 * code, on top of (not instead of) the real login/session check those
 * routes already enforce. Unset by default so a dynamic home IP can't lock
 * the owner out without opting in first.
 */
function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/api/admin/");
}

function isAllowedAdminIp(req: NextRequest): boolean {
  const raw = process.env.ADMIN_IP_ALLOWLIST;
  if (!raw) return true;
  const allowed = raw
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  return allowed.includes(clientIp(req));
}

/**
 * Forces HTTPS in production. Most hosts (Vercel included) already redirect
 * at the edge, but this makes it explicit and host-independent — it reads
 * the standard `x-forwarded-proto` header set by the reverse proxy in front
 * of the Node process, since Next.js itself never sees a raw TLS handshake.
 */
export function middleware(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  if (process.env.NODE_ENV === "production" && proto === "http") {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  if (isAdminPath(req.nextUrl.pathname) && !isAllowedAdminIp(req)) {
    console.warn(`[security] blocked /admin request from disallowed IP: ${clientIp(req)}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

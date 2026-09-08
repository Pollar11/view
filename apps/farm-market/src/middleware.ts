import { NextResponse, type NextRequest } from "next/server";

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
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

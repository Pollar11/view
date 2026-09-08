import { NextResponse } from "next/server";

/** Liveness/readiness check for uptime monitors and load balancers. */
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}

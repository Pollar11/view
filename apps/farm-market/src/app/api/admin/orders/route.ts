import { NextResponse } from "next/server";
import { createCsrfToken, getAdminToken, verifyAdminToken } from "@/lib/admin-auth";
import { getStats, listOrders, listSmsLog } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const token = getAdminToken(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!rateLimit(req, "admin-orders", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return NextResponse.json({
    orders: listOrders(),
    stats: getStats(),
    smsLog: listSmsLog(),
    csrfToken: createCsrfToken(token!),
  });
}

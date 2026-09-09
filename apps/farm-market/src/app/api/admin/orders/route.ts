import { NextResponse } from "next/server";
import { createCsrfToken, getAdminToken, verifyAdminToken } from "@/lib/admin-auth";
import { getStats, listOrders, listSmsLog } from "@/lib/db";

export async function GET(req: Request) {
  const token = getAdminToken(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    orders: listOrders(),
    stats: getStats(),
    smsLog: listSmsLog(),
    csrfToken: createCsrfToken(token!),
  });
}

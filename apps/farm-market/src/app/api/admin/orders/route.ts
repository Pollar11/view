import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getStats, listOrders, listSmsLog } from "@/lib/db";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    orders: listOrders(),
    stats: getStats(),
    smsLog: listSmsLog(),
  });
}

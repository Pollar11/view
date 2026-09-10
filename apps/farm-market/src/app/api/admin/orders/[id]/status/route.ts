import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminToken, verifyAdminToken, verifyCsrfToken } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

const bodySchema = z.object({
  status: z.enum(["confirmed", "processing", "out_for_delivery", "delivered"]),
});

/**
 * The one place an order's real (not time-estimated) fulfillment status
 * gets set — an admin picking a stage in /admin's order list. This is what
 * makes the customer-facing tracker "live" rather than a pure time guess:
 * see lib/order-status.ts computeOrderStage, which prefers this over the
 * elapsed-time estimate the moment it's been set once.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = getAdminToken(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!verifyCsrfToken(token, req.headers.get("x-csrf-token"))) {
    console.warn(`[security] rejected order-status update with missing/invalid CSRF token from ${clientIp(req)}`);
    return NextResponse.json({ error: "Invalid request — please refresh and try again." }, { status: 403 });
  }
  if (!rateLimit(req, "admin-order-status", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readBoundedJson(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const order = await updateOrderStatus(params.id, parsed.data.status);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

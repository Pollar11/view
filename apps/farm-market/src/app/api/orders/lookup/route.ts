import { NextResponse } from "next/server";
import { listOrders } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Lets a customer find their order again with just the short code shown at
 * checkout ("Order #XXXXXX") instead of the full confirmation link. That
 * code is only the last 6 hex characters of the order ID — lower entropy
 * than the full ID used by /api/orders/[id] — so this is rate-limited more
 * tightly to keep brute-forcing impractical, and returns only the order ID
 * (not order details); the client then redirects to /order/[id], which
 * does its own lookup and is where the actual order data is shown.
 */
export async function GET(req: Request) {
  if (!rateLimit(req, "order-code-lookup", { limit: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-character order code." }, { status: 400 });
  }

  const order = listOrders().find((o) => o.id.slice(-6).toUpperCase() === code);
  if (!order) {
    return NextResponse.json({ error: "No order found with that code." }, { status: 404 });
  }
  return NextResponse.json({ orderId: order.id });
}

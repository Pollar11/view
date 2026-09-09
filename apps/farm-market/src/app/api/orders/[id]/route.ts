import { NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Access control here is "possession of the order ID" (a 48-bit random
 * token, same pattern real order-confirmation links use — Shopify, Amazon,
 * etc. — not a login-gated resource). That's a legitimate model, not a
 * shortcut: the confirmation page is meant to be reachable right after
 * checkout without an account. Rate limiting is still worth it as
 * defense-in-depth against a bulk ID-guessing attempt, since the order
 * contains the customer's name/address/phone.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!rateLimit(req, "order-lookup", { limit: 30, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

import { NextResponse } from "next/server";
import { getPendingCheckout, getOrder } from "@/lib/db";
import { finalizeStripeCheckout } from "@/lib/checkout-finalize";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Polled by the /checkout/processing page right after a Stripe redirect.
 * The webhook is the authoritative way an order gets created, but webhook
 * delivery can lag a second or two behind the browser's own redirect back
 * from Stripe — so this also actively checks Stripe and finalizes here if
 * the webhook hasn't landed yet, purely to make the UI feel instant; it's
 * the same idempotent finalize function either way.
 */
export async function GET(req: Request) {
  if (!rateLimit(req, "checkout-stripe-status", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const pendingId = searchParams.get("pending") ?? "";
  if (!pendingId) {
    return NextResponse.json({ error: "Missing pending checkout id" }, { status: 400 });
  }

  const pending = getPendingCheckout(pendingId);
  if (!pending) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pending.status === "completed" && pending.orderId) {
    const order = getOrder(pending.orderId);
    return NextResponse.json({ status: "completed", order: order ?? null });
  }

  const order = await finalizeStripeCheckout(pendingId);
  if (order) {
    return NextResponse.json({ status: "completed", order });
  }

  return NextResponse.json({ status: "pending" });
}

import { NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { finalizeStripeCheckout } from "@/lib/checkout-finalize";

/**
 * The authoritative confirmation that a Stripe payment actually succeeded
 * — Stripe calls this server-to-server once a Checkout Session completes.
 * Trust here comes entirely from the signature (Stripe-Signature header,
 * verified against STRIPE_WEBHOOK_SECRET), never from the request's IP or
 * any header a caller could just set themselves: this is the one place in
 * the app where "payment succeeded" gets acted on, so a forged call here
 * would mean free orders. Requires the *raw* request body — reading it any
 * other way (e.g. through a JSON-parsing helper) breaks signature
 * verification, which hashes the exact bytes Stripe sent.
 */
export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!isStripeConfigured() || !stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn("[security] rejected Stripe webhook with invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const pendingId = session.client_reference_id;
    if (pendingId) {
      try {
        await finalizeStripeCheckout(pendingId);
      } catch (err) {
        console.error("[stripe webhook] failed to finalize checkout:", pendingId, err);
        // Returning 200 anyway — the processing page's own fallback poll
        // can also finalize this, and retrying a broken pendingId forever
        // wouldn't help. A real failure here is worth alerting on
        // separately, not blocking Stripe's retry queue over.
      }
    }
  }

  return NextResponse.json({ received: true });
}

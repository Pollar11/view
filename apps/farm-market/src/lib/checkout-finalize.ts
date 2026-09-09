import { claimPendingCheckout, completePendingCheckout, getOrder, getPendingCheckout } from "./db";
import { fulfillOrder } from "./order-fulfillment";
import { getStripeClient } from "./stripe";
import type { Order } from "./types";

/**
 * Turns a paid Stripe Checkout Session into a real Order — called from
 * both the webhook (the authoritative path) and the /checkout/processing
 * page's fallback poll (so the customer isn't stuck waiting on webhook
 * latency). Idempotent: if the pending checkout is already completed,
 * returns the existing order instead of creating a second one, so it's
 * safe to call from both places, and safe for Stripe to retry the webhook.
 */
export async function finalizeStripeCheckout(pendingId: string): Promise<Order | null> {
  const pending = getPendingCheckout(pendingId);
  if (!pending) return null;

  if (pending.status === "completed") {
    return pending.orderId ? (getOrder(pending.orderId) ?? null) : null;
  }

  if (!pending.stripeSessionId) return null;

  const stripe = getStripeClient();
  if (!stripe) return null;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(pending.stripeSessionId, {
      expand: ["payment_intent.payment_method"],
    });
  } catch (err) {
    // Transient Stripe API trouble — treat as "not confirmed yet" rather
    // than failing the request; the webhook or a later poll will retry.
    console.error("[stripe] failed to retrieve checkout session:", pendingId, err);
    return null;
  }
  if (session.payment_status !== "paid") return null;

  if (!claimPendingCheckout(pendingId)) {
    // Another call (webhook + fallback poll racing) claimed it a moment
    // ago, within this same instance — its result will land shortly.
    return null;
  }

  let cardLast4: string | null = null;
  let cardBrand: string | null = null;
  const paymentIntent = session.payment_intent;
  if (paymentIntent && typeof paymentIntent === "object") {
    const paymentMethod = paymentIntent.payment_method;
    if (paymentMethod && typeof paymentMethod === "object" && paymentMethod.card) {
      cardLast4 = paymentMethod.card.last4;
      cardBrand = paymentMethod.card.brand;
    }
  }

  const order = await fulfillOrder({
    items: pending.items,
    subtotal: pending.subtotal,
    bundleDiscountRate: pending.bundleDiscountRate,
    bundleDiscountAmount: pending.bundleDiscountAmount,
    discountCode: pending.discountCode,
    discountAmount: pending.discountAmount,
    deliveryFee: pending.deliveryFee,
    total: pending.total,
    deliveryEtaDays: pending.deliveryEtaDays,
    deliveryMiles: pending.deliveryMiles,
    address: pending.address,
    phone: pending.phone,
    smsOptIn: pending.smsOptIn,
    paymentMethod: "stripe",
    cardLast4,
    cardBrand,
    utm: pending.utm,
  });

  await completePendingCheckout(pendingId, order.id);
  return order;
}

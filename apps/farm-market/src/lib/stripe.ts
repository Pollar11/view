import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

/** Null when STRIPE_SECRET_KEY isn't set — callers must check
 * isStripeConfigured() (or handle null) rather than assume a client. */
export function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return client;
}

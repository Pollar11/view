import { logSms } from "./db";

interface SendSmsInput {
  to: string;
  body: string;
  campaign: string;
  customerId: string | null;
}

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

/**
 * Sends a real SMS via Twilio when TWILIO_* env vars are configured;
 * otherwise records the message as a "mock" send so the rest of the app
 * (order confirmations, win-back campaigns) works end-to-end without any
 * third-party account, and nothing is silently pretended to have been sent.
 */
export async function sendSms(input: SendSmsInput) {
  if (!twilioConfigured()) {
    return logSms({
      to: input.to,
      body: input.body,
      mode: "mock",
      campaign: input.campaign,
      customerId: input.customerId,
    });
  }

  try {
    const { default: Twilio } = await import("twilio");
    const client = Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
    await client.messages.create({
      to: input.to,
      from: process.env.TWILIO_FROM_NUMBER!,
      body: input.body,
    });
    return logSms({
      to: input.to,
      body: input.body,
      mode: "live",
      campaign: input.campaign,
      customerId: input.customerId,
    });
  } catch (err) {
    return logSms({
      to: input.to,
      body: input.body,
      mode: "error",
      campaign: input.campaign,
      customerId: input.customerId,
      error: err instanceof Error ? err.message : "Unknown Twilio error",
    });
  }
}

export function orderConfirmationSms(opts: {
  name: string;
  orderId: string;
  city: string;
  zip: string;
  etaDays: number;
  total: number;
}) {
  const firstName = opts.name.split(" ")[0] || "there";
  return (
    `Hi ${firstName}! Your Meadow & Market order #${opts.orderId.slice(-6)} ` +
    `($${opts.total.toFixed(2)}) is confirmed for delivery to ${opts.city}, ${opts.zip} ` +
    `in about ${opts.etaDays} day${opts.etaDays === 1 ? "" : "s"}. ` +
    `Reply STOP to opt out of texts.`
  );
}

export function winBackSms(opts: {
  name: string;
  code: string;
  percentOff: number;
  expiresAt: string;
}) {
  const firstName = opts.name.split(" ")[0] || "there";
  const expiry = new Date(opts.expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    `${firstName}, it's been a while! Here's ${opts.percentOff}% off your next ` +
    `Meadow & Market order: code ${opts.code}, valid through ${expiry}. ` +
    `Reply STOP to opt out.`
  );
}

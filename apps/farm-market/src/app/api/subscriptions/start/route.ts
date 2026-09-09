import { NextResponse } from "next/server";
import { z } from "zod";
import { phoneSchema, honeypotSchema, isHoneypotTripped } from "@/lib/validation";
import { quoteSubscription } from "@/lib/subscriptions";
import { CATEGORY_LABELS } from "@/lib/products";
import type { Category } from "@/lib/types";
import { createSubscriptionLead } from "@/lib/db";
import { sendSms, subscriptionLeadSms } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

const bodySchema = z.object({
  category: z.string(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  website: honeypotSchema,
});

/**
 * Records subscription interest and texts a confirmation — this does NOT
 * set up real recurring billing (no payment processor is wired in this
 * environment). The farm follows up by phone to actually start the plan,
 * same as the SMS says.
 */
export async function POST(req: Request) {
  if (!rateLimit(req, "subscription-start", { limit: 3, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many requests — please wait a bit and try again." },
      { status: 429 },
    );
  }

  const body = await readBoundedJson(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check your name, phone, and ZIP and try again." },
      { status: 422 },
    );
  }

  if (isHoneypotTripped(parsed.data.website)) {
    return NextResponse.json({ ok: true });
  }

  const category = parsed.data.category as Category;
  if (!(category in CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const quote = quoteSubscription(category, parsed.data.zip);
  if (!quote || !quote.inServiceArea) {
    return NextResponse.json(
      { error: "That ZIP is outside our delivery radius for subscriptions." },
      { status: 422 },
    );
  }

  const lead = await createSubscriptionLead({
    category,
    planLabel: `${CATEGORY_LABELS[category]} — ${quote.plan.quantityLabel}`,
    zip: parsed.data.zip,
    monthlyPrice: quote.monthlyTotal,
    deliveryMiles: quote.deliveryMiles,
    phone: parsed.data.phone,
    name: parsed.data.name,
  });

  await sendSms({
    to: parsed.data.phone,
    body: subscriptionLeadSms({
      name: parsed.data.name,
      planLabel: CATEGORY_LABELS[category],
      monthlyTotal: quote.monthlyTotal,
    }),
    campaign: "subscription-lead",
    customerId: null,
  });

  return NextResponse.json({ lead });
}

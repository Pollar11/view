import { NextResponse } from "next/server";
import { z } from "zod";
import { phoneSchema, cartLineSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/pricing";
import { sendSms, cartReminderSms } from "@/lib/sms";

const bodySchema = z.object({
  phone: phoneSchema,
  items: z.array(cartLineSchema).min(1),
});

/**
 * User-initiated only — there is no background job that fires this
 * automatically. A visitor must be on the cart page and explicitly tap
 * "Text me this cart" and supply their number, which is treated as consent
 * for this one message (same spirit as the checkout SMS opt-in).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid phone number first." },
      { status: 422 },
    );
  }

  const totals = computeTotals(parsed.data.items);
  if (totals.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 422 });
  }

  await sendSms({
    to: parsed.data.phone,
    body: cartReminderSms({ itemCount: totals.items.length, total: totals.total }),
    campaign: "cart-reminder",
    customerId: null,
  });

  return NextResponse.json({ ok: true });
}

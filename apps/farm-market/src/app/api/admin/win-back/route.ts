import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { createCoupon, listCustomers } from "@/lib/db";
import { sendSms, winBackSms } from "@/lib/sms";

const bodySchema = z.object({
  customerIds: z.array(z.string()).min(1),
  percentOff: z.number().int().min(5).max(50).default(15),
  ttlDays: z.number().int().min(1).max(60).default(7),
});

/**
 * Store-owner-triggered win-back campaign: texts a discount code to
 * previously-purchased customers who opted into SMS marketing. This is
 * never fired automatically — an admin must pick recipients and click
 * "Send" from /admin, and only customers with smsOptIn=true are ever
 * contacted (opted-out customers are skipped even if selected).
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const customers = listCustomers();
  const results: {
    customerId: string;
    name: string;
    status: "sent" | "skipped-not-opted-in" | "not-found";
    code?: string;
  }[] = [];

  for (const customerId of parsed.data.customerIds) {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      results.push({ customerId, name: "unknown", status: "not-found" });
      continue;
    }
    if (!customer.smsOptIn) {
      results.push({
        customerId,
        name: customer.name,
        status: "skipped-not-opted-in",
      });
      continue;
    }

    const coupon = await createCoupon({
      percentOff: parsed.data.percentOff,
      campaign: "win-back",
      customerId: customer.id,
      ttlDays: parsed.data.ttlDays,
    });

    await sendSms({
      to: customer.phone,
      body: winBackSms({
        name: customer.name,
        code: coupon.code,
        percentOff: coupon.percentOff,
        expiresAt: coupon.expiresAt,
      }),
      campaign: "win-back",
      customerId: customer.id,
    });

    results.push({
      customerId,
      name: customer.name,
      status: "sent",
      code: coupon.code,
    });
  }

  return NextResponse.json({ results });
}

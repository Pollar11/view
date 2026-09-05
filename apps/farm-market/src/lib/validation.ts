import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d+]/g, ""))
  .refine((v) => /^\+?1?\d{10}$/.test(v), {
    message: "Enter a valid 10-digit US phone number",
  })
  .transform((v) => {
    const digits = v.replace(/^\+?1/, "");
    return `+1${digits}`;
  });

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  street: z.string().trim().min(4, "Enter a street address").max(120),
  city: z.string().trim().min(2, "Enter a city").max(60),
  state: z
    .string()
    .trim()
    .length(2, "Use a 2-letter state code")
    .transform((v) => v.toUpperCase()),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  notes: z.string().trim().max(300).optional(),
});

export const cartLineSchema = z.object({
  slug: z.string().min(1),
  unitLabel: z.string().min(1),
  weightLb: z.number().positive().nullable(),
  qty: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  address: addressSchema,
  phone: phoneSchema,
  smsOptIn: z.boolean(),
  paymentMethod: z.enum(["cod", "card_demo"]),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  card: z
    .object({
      number: z.string().trim(),
      expiry: z.string().trim(),
      cvc: z.string().trim(),
    })
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Luhn check for the demo card form — no real payment processor is contacted. */
export function isLuhnValid(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

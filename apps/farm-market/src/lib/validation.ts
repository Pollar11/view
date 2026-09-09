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

/**
 * Honeypot field: rendered visually hidden in the real form, so a human
 * never fills it in, but a simple bot that auto-fills every input will.
 * Callers check `isHoneypotTripped()` and, if true, return a normal-looking
 * success without actually sending anything — that avoids tipping the bot
 * off (an error response just teaches it to skip that field next time).
 */
export const honeypotSchema = z.string().optional().default("");
export function isHoneypotTripped(value: string | undefined): boolean {
  return Boolean(value && value.length > 0);
}

export const cartLineSchema = z.object({
  slug: z.string().min(1),
  unitLabel: z.string().min(1),
  weightLb: z.number().positive().nullable(),
  qty: z.number().int().positive().max(50),
});

export const utmSchema = z
  .object({
    source: z.string().trim().max(100).optional(),
    medium: z.string().trim().max(100).optional(),
    campaign: z.string().trim().max(100).optional(),
    term: z.string().trim().max(100).optional(),
    content: z.string().trim().max(100).optional(),
  })
  .optional()
  .nullable();

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  address: addressSchema,
  phone: phoneSchema,
  smsOptIn: z.boolean(),
  paymentMethod: z.enum(["cod", "stripe"]),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  utm: utmSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

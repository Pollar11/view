export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/** Formats digits into "555-123-4567" as the customer types, so the phone
 * field always reads clearly instead of a raw run of digits. Non-digit
 * input (spaces, parens, an already-typed dash) is stripped first so
 * pasting a formatted number reformats cleanly instead of doubling up. */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Groups a demo card number into 4-digit blocks ("4242 4242 4242 4242")
 * as the customer types, up to 19 digits (the longest real PAN length). */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Formats a demo expiry as "MM/YY" — inserts the slash automatically once
 * two digits are typed, so the customer never has to type it themselves. */
export function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

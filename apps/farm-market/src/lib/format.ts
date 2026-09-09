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

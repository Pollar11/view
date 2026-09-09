export type PaymentMethod = "cod" | "stripe";

export interface ReturningCustomer {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  smsOptIn: boolean;
  paymentMethod: PaymentMethod;
}

const STORAGE_KEY = "mm_returning_customer";

/**
 * Remembers a customer's checkout details in this browser only — no server
 * round trip, no PII exposed to anyone who can guess a phone number. Never
 * includes card number/expiry/CVC: those are demo fields that shouldn't be
 * persisted even in a demo build, only the *choice* of payment method.
 */
export function saveReturningCustomer(data: ReturningCustomer): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage can throw in private-browsing/storage-restricted
    // contexts — losing the autofill convenience isn't worth failing for.
  }
}

export function loadReturningCustomer(): ReturningCustomer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReturningCustomer;
  } catch {
    return null;
  }
}

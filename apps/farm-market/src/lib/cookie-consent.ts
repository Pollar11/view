export type ConsentValue = "accepted" | "declined";

const STORAGE_KEY = "meadow-cookie-consent";
export const CONSENT_EVENT = "meadow-cookie-consent-changed";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  } catch {
    // storage unavailable — consent just won't persist across visits
  }
}

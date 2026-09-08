"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { CONSENT_EVENT, getConsent } from "@/lib/cookie-consent";

/**
 * Cookieless, privacy-friendly pageview analytics (Vercel Analytics — no
 * personal data, no tracking cookie), still gated behind explicit cookie
 * banner consent since the checklist asked for consent-gated analytics.
 * No-ops harmlessly when not deployed on Vercel.
 */
export function SiteAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getConsent() === "accepted");
    function onChange(e: Event) {
      setEnabled((e as CustomEvent).detail === "accepted");
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  function choose(value: "accepted" | "declined") {
    setConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line-light bg-surface-light p-4 shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-softDark sm:p-5">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-light/90 dark:text-ink-dark/90">
          We use essential cookies to run this site (like keeping the farm
          dashboard signed in) and, only with your OK, anonymous analytics to
          see which pages are useful. See our{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => choose("declined")} className="btn-secondary px-4 py-2 text-sm">
            Decline
          </button>
          <button onClick={() => choose("accepted")} className="btn-primary px-4 py-2 text-sm">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

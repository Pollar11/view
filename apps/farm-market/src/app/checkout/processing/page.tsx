"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";
import { FARM_PHONE } from "@/lib/site";

const POLL_INTERVAL_MS = 1200;
const TIMEOUT_MS = 30_000;

export default function StripeProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <StripeProcessingContent />
    </Suspense>
  );
}

/**
 * Landing page right after a Stripe redirect (success_url). The order
 * doesn't necessarily exist yet the instant the browser gets here — it's
 * created once payment is confirmed (webhook, or this page's own fallback
 * poll below) — so this polls briefly rather than assuming success.
 */
function StripeProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingId = searchParams.get("pending") ?? "";
  const [state, setState] = useState<"waiting" | "timeout" | "error">("waiting");
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!pendingId) {
      setState("error");
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/checkout/stripe-status?pending=${encodeURIComponent(pendingId)}`);
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = await res.json();
        if (data.status === "completed" && data.order) {
          try {
            sessionStorage.setItem(`order:${data.order.id}`, JSON.stringify(data.order));
          } catch {
            // sessionStorage can throw in private-browsing contexts — the
            // confirmation page's own API fallback still covers this.
          }
          router.push(`/order/${data.order.id}`);
          return;
        }
        if (Date.now() - startedAt.current > TIMEOUT_MS) {
          setState("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setState("error");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [pendingId, router]);

  if (state === "waiting") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <Spinner className="h-8 w-8" />
        <h1 className="mt-4 text-xl font-semibold">Confirming your payment…</h1>
        <p className="mt-2 text-sm text-ink-light/70 dark:text-ink-dark/70">
          This only takes a moment — don&apos;t close this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="text-xl font-semibold">Still confirming your payment</h1>
      <p className="mt-2 text-sm text-ink-light/70 dark:text-ink-dark/70">
        Stripe took longer than usual to confirm this one. If your card was
        charged, your order will still go through shortly — check{" "}
        <Link href="/track" className="underline">Track your order</Link>{" "}
        in a minute, or call {FARM_PHONE} with your payment confirmation if
        you&apos;re not sure.
      </p>
      <Link href="/shop" className="btn-secondary mt-6 inline-flex">Back to shop</Link>
    </div>
  );
}

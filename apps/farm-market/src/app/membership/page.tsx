"use client";

import { useState } from "react";
import { MEMBERSHIP_TIERS } from "@/lib/membership";
import { money } from "@/lib/format";

export default function MembershipPage() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{
    found: boolean;
    tier?: string;
    perk?: string;
    totalOrders?: number;
    totalSpent?: number;
  } | null>(null);

  async function checkStatus() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/membership/status?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setResult(await res.json());
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Membership</h1>
      <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
        There&apos;s no separate account to create — your tier is based on the
        phone number you use at checkout. Order more, unlock more.
      </p>

      <div className="mt-8 space-y-3">
        {MEMBERSHIP_TIERS.map((tier) => (
          <div key={tier.name} className="card flex items-center justify-between p-4">
            <div>
              <div className="font-semibold">{tier.name}</div>
              <div className="text-sm text-ink-light/85 dark:text-ink-dark/85">{tier.perk}</div>
            </div>
            <span className="pill bg-black/5 dark:bg-white/10">
              {tier.minOrders === 0 ? "Everyone" : `${tier.minOrders}+ orders`}
            </span>
          </div>
        ))}
      </div>

      <div className="card mt-10 p-6">
        <h2 className="font-semibold">Check your tier</h2>
        <p className="mt-1 text-sm text-ink-light/85 dark:text-ink-dark/85">
          Enter the phone number you&apos;ve used at checkout.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={checkStatus} disabled={status === "loading"} className="btn-secondary shrink-0 px-4">
            {status === "loading" ? "Checking…" : "Check"}
          </button>
        </div>
        {status === "error" && <p className="field-error">Enter a valid phone number.</p>}
        {status === "done" && result && (
          <div className="mt-4 rounded-lg bg-black/5 p-4 text-sm dark:bg-white/5">
            {result.found ? (
              <>
                <p className="font-semibold">
                  You&apos;re {result.tier} tier — {result.totalOrders} order{result.totalOrders === 1 ? "" : "s"},{" "}
                  {money(result.totalSpent ?? 0)} total.
                </p>
                <p className="mt-1 text-ink-light/85 dark:text-ink-dark/85">{result.perk}</p>
              </>
            ) : (
              <p>No orders yet on that number — place your first order to become a Pasture-tier member.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FARM_PHONE } from "@/lib/site";

export default function TrackOrderPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(clean)) {
      setStatus("error");
      setError("That doesn't look like an order code — it's 6 letters/numbers, e.g. 62711F.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`/api/orders/lookup?code=${clean}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Couldn't find that order.");
        return;
      }
      router.push(`/order/${data.orderId}`);
    } catch {
      setStatus("error");
      setError("Network error — please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
      <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
        Enter the order code from your confirmation page or text — it&apos;s the
        6 characters after &ldquo;Order #&rdquo;.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-3 p-5">
        <input
          className="input text-center text-lg font-semibold uppercase tracking-widest"
          placeholder="62711F"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
        />
        {status === "error" && <p className="field-error">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Looking up…" : "Track order"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-light/70 dark:text-ink-dark/70">
        Have your full confirmation link instead? Just open it directly. Can&apos;t find
        either? Call {FARM_PHONE}.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Stats {
  ordersLast24h: number;
  ordersLast7d: number;
  totalOrders: number;
  totalCustomers: number;
}

/**
 * Shows genuine order-volume numbers pulled from the real order log — never
 * a randomized or fabricated "N people are viewing this" counter.
 */
export function SocialProofTicker() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.totalOrders === 0) return null;

  const message =
    stats.ordersLast24h > 0
      ? `🔥 ${stats.ordersLast24h} order${stats.ordersLast24h === 1 ? "" : "s"} placed in the last 24 hours`
      : stats.ordersLast7d > 0
        ? `${stats.ordersLast7d} orders placed this week`
        : `${stats.totalOrders} orders delivered so far`;

  return (
    <div className="mx-auto w-fit rounded-full border border-line-light bg-surface-light px-4 py-1.5 text-xs font-medium text-ink-light/70 shadow-soft dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark/70">
      {message}
    </div>
  );
}

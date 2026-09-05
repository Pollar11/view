"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import type { Customer, Order, SmsLogEntry } from "@/lib/types";

interface OrdersResponse {
  orders: Order[];
  stats: { ordersLast24h: number; ordersLast7d: number; totalOrders: number; totalCustomers: number };
  smsLog: SmsLogEntry[];
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [percentOff, setPercentOff] = useState(15);
  const [ttlDays, setTtlDays] = useState(7);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<
    { customerId: string; name: string; status: string; code?: string }[] | null
  >(null);

  async function refresh() {
    const [ordersRes, customersRes] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/admin/customers"),
    ]);
    if (ordersRes.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setData(await ordersRes.json());
    const custData = await customersRes.json();
    setCustomers(custData.customers ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Incorrect password");
      return;
    }
    await refresh();
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function sendWinBack() {
    setSending(true);
    setResults(null);
    const res = await fetch("/api/admin/win-back", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerIds: Array.from(selected),
        percentOff,
        ttlDays,
      }),
    });
    const json = await res.json();
    setResults(json.results ?? []);
    setSending(false);
    setSelected(new Set());
    refresh();
  }

  if (authed === null) {
    return <div className="mx-auto max-w-md px-5 py-24 text-center text-ink-light/50">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24">
        <h1 className="text-2xl font-bold">Farm dashboard</h1>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Owner access only. Default demo password is <code>farm2026</code>{" "}
          unless <code>ADMIN_PASSWORD</code> is set.
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            type="password"
            className="input"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && <p className="field-error">{loginError}</p>}
          <button className="btn-primary w-full">Sign in</button>
        </form>
      </div>
    );
  }

  const winBackCandidates = customers.filter((c) => c.smsOptIn);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Farm dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Orders (24h)" value={data?.stats.ordersLast24h ?? 0} />
        <Stat label="Orders (7d)" value={data?.stats.ordersLast7d ?? 0} />
        <Stat label="Total orders" value={data?.stats.totalOrders ?? 0} />
        <Stat label="Customers" value={data?.stats.totalCustomers ?? 0} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Win-back SMS campaign</h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Only sends to customers who opted into SMS at checkout — never automatic,
          you choose who gets texted and click send.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <span className="label">Discount %</span>
            <input
              type="number"
              className="input w-24"
              min={5}
              max={50}
              value={percentOff}
              onChange={(e) => setPercentOff(Number(e.target.value))}
            />
          </div>
          <div>
            <span className="label">Expires in (days)</span>
            <input
              type="number"
              className="input w-24"
              min={1}
              max={60}
              value={ttlDays}
              onChange={(e) => setTtlDays(Number(e.target.value))}
            />
          </div>
          <button
            onClick={sendWinBack}
            disabled={sending || selected.size === 0}
            className="btn-primary"
          >
            {sending ? "Sending…" : `Send to ${selected.size} customer${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-light text-left text-ink-light/50 dark:border-line-dark dark:text-ink-dark/50">
                <th className="py-2"></th>
                <th className="py-2">Customer</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Spent</th>
                <th className="py-2">Last order</th>
              </tr>
            </thead>
            <tbody>
              {winBackCandidates.map((c) => (
                <tr key={c.id} className="border-b border-line-light/50 dark:border-line-dark/50">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelected(c.id)}
                    />
                  </td>
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-ink-light/60 dark:text-ink-dark/60">{c.phone}</td>
                  <td className="py-2">{c.totalOrders}</td>
                  <td className="py-2">{money(c.totalSpent)}</td>
                  <td className="py-2 text-ink-light/60 dark:text-ink-dark/60">
                    {new Date(c.lastOrderAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {winBackCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-light/40">
                    No SMS-opted-in customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {results && (
          <div className="mt-4 space-y-1 rounded-lg bg-black/5 p-4 text-sm dark:bg-white/5">
            {results.map((r) => (
              <div key={r.customerId}>
                {r.name} — {r.status}
                {r.code ? ` (code ${r.code})` : ""}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Recent orders</h2>
        <div className="mt-4 space-y-2">
          {data?.orders.slice(0, 15).map((o) => (
            <div key={o.id} className="card flex items-center justify-between p-3 text-sm">
              <span>#{o.id.slice(-6).toUpperCase()} — {o.address.fullName} ({o.address.city}, {o.address.state})</span>
              <span className="font-semibold">{money(o.total)}</span>
            </div>
          ))}
          {(!data || data.orders.length === 0) && (
            <p className="text-ink-light/40">No orders yet.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">SMS log</h2>
        <div className="mt-4 space-y-2">
          {data?.smsLog.slice(0, 15).map((s) => (
            <div key={s.id} className="card p-3 text-xs">
              <div className="flex justify-between font-medium">
                <span>{s.to} · {s.campaign} · {s.mode}</span>
                <span className="text-ink-light/40">{new Date(s.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-ink-light/60 dark:text-ink-dark/60">{s.body}</p>
            </div>
          ))}
          {(!data || data.smsLog.length === 0) && (
            <p className="text-ink-light/40">No messages sent yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-ink-light/50 dark:text-ink-dark/50">{label}</div>
    </div>
  );
}

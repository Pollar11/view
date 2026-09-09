"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import type { Customer, Order, SmsLogEntry } from "@/lib/types";
import { ConfirmModal } from "@/components/ConfirmModal";

interface OrdersResponse {
  orders: Order[];
  stats: { ordersLast24h: number; ordersLast7d: number; totalOrders: number; totalCustomers: number };
  smsLog: SmsLogEntry[];
  csrfToken: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [confirmWinBack, setConfirmWinBack] = useState(false);

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
      const data = await res.json().catch(() => null);
      setLoginError(data?.error ?? "Incorrect password");
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
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": data?.csrfToken ?? "",
      },
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
    return <div className="mx-auto max-w-md px-5 py-24 text-center text-ink-light/80">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24">
        <h1 className="text-2xl font-bold">Farm dashboard</h1>
        <p className="mt-1 text-sm text-ink-light/85 dark:text-ink-dark/85">
          Owner access only. Set <code>ADMIN_PASSWORD</code> in your environment
          before deploying — see the project README for the local-dev default.
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input pr-16"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-light/70 hover:text-accent dark:text-ink-dark/70 dark:hover:text-accent-light"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
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
        <p className="mt-1 text-sm text-ink-light/85 dark:text-ink-dark/85">
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
            onClick={() => setConfirmWinBack(true)}
            disabled={sending || selected.size === 0}
            className="btn-primary"
          >
            {sending ? "Sending…" : `Send to ${selected.size} customer${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>

        <ConfirmModal
          open={confirmWinBack}
          title="Send win-back texts?"
          message={`This sends a real SMS with a ${percentOff}% discount code to ${selected.size} customer${selected.size === 1 ? "" : "s"} right now. This can't be undone.`}
          confirmLabel="Send now"
          onConfirm={() => {
            setConfirmWinBack(false);
            sendWinBack();
          }}
          onCancel={() => setConfirmWinBack(false)}
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-light text-left text-ink-light/80 dark:border-line-dark dark:text-ink-dark/80">
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
                  <td className="py-2 text-ink-light/85 dark:text-ink-dark/85">{c.phone}</td>
                  <td className="py-2">{c.totalOrders}</td>
                  <td className="py-2">{money(c.totalSpent)}</td>
                  <td className="py-2 text-ink-light/85 dark:text-ink-dark/85">
                    {new Date(c.lastOrderAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {winBackCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-light/75">
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
              <span>
                #{o.id.slice(-6).toUpperCase()} — {o.address.fullName} ({o.address.city}, {o.address.state})
                {o.utm?.source && (
                  <span className="ml-2 pill bg-black/5 text-[10px] dark:bg-white/10">
                    via {o.utm.source}{o.utm.medium ? `/${o.utm.medium}` : ""}
                  </span>
                )}
              </span>
              <span className="font-semibold">{money(o.total)}</span>
            </div>
          ))}
          {(!data || data.orders.length === 0) && (
            <p className="text-ink-light/75">No orders yet.</p>
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
                <span className="text-ink-light/75">{new Date(s.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-ink-light/85 dark:text-ink-dark/85">{s.body}</p>
            </div>
          ))}
          {(!data || data.smsLog.length === 0) && (
            <p className="text-ink-light/75">No messages sent yet.</p>
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
      <div className="text-xs text-ink-light/80 dark:text-ink-dark/80">{label}</div>
    </div>
  );
}

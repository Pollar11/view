"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "./Logo";

export function GateLogin() {
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockLeft, setLockLeft] = useState(0);

  useEffect(() => {
    if (lockLeft <= 0) return;
    const t = setInterval(() => setLockLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockLeft]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockLeft > 0) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfter?: number;
        attemptsLeft?: number;
      };
      if (res.ok) {
        // hard navigation so middleware re-runs with the fresh session cookie
        window.location.assign(next.startsWith("/") ? next : "/");
        return;
      }
      if (data.retryAfter) {
        setLockLeft(data.retryAfter);
        setErr(`Too many attempts. Locked for 2 minutes.`);
      } else {
        setErr(
          data.attemptsLeft != null
            ? `${data.error} ${data.attemptsLeft} attempt${
                data.attemptsLeft === 1 ? "" : "s"
              } left.`
            : (data.error ?? "Sign in failed."),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const mm = String(Math.floor(lockLeft / 60)).padStart(1, "0");
  const ss = String(lockLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)] px-5">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="flex justify-center text-2xl">
          <Logo />
        </div>
        <p className="mt-6 text-center text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)]">
          Sign in to continue
        </p>

        <div className="mt-7 space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            autoComplete="username"
            disabled={lockLeft > 0}
            className="w-full rounded border hairline bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-[var(--fg)] disabled:opacity-50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            disabled={lockLeft > 0}
            className="w-full rounded border hairline bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-[var(--fg)] disabled:opacity-50"
          />
        </div>

        {err && (
          <p className="mt-3 text-center text-[0.8rem] text-red-600">{err}</p>
        )}
        {lockLeft > 0 && (
          <p className="mt-2 text-center text-[0.8rem] tabular-nums text-[var(--muted)]">
            Try again in {mm}:{ss}
          </p>
        )}

        <button
          disabled={busy || lockLeft > 0 || !username || !password}
          className="tsl-btn tsl-btn-solid mt-6 w-full disabled:opacity-40"
        >
          {busy ? "…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

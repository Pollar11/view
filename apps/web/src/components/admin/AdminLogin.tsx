"use client";

import { useState } from "react";

export function AdminLogin() {
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setBusy(false);
    if (res.ok) window.location.reload();
    else setErr((await res.json().catch(() => ({})))?.error ?? "Failed");
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-24 max-w-sm rounded-lg border hairline p-6"
    >
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-xl font-medium">Sign in</h1>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="ADMIN_TOKEN"
        autoFocus
        className="mt-4 w-full rounded border hairline bg-transparent px-3 py-2 outline-none"
      />
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <button
        disabled={busy || !token}
        className="tsl-btn tsl-btn-solid mt-4 w-full disabled:opacity-50"
      >
        {busy ? "…" : "Enter"}
      </button>
    </form>
  );
}

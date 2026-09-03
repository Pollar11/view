"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Overrides } from "@/lib/overrides";

type Data = {
  store: "kv" | "memory";
  overrides: Overrides;
  sections: { slug: string; title: string }[];
  sports: string[];
};

export function AdminPanel({ data }: { data: Data }) {
  const router = useRouter();
  const [o, setO] = useState<Overrides>(data.overrides);
  const [saved, setSaved] = useState<"idle" | "saving" | "done" | "err">("idle");

  const sectionOv = (slug: string) => o.sections?.[slug] ?? {};
  const patchSection = (slug: string, p: Partial<NonNullable<Overrides["sections"]>[string]>) =>
    setO((c) => ({
      ...c,
      sections: { ...c.sections, [slug]: { ...c.sections?.[slug], ...p } },
    }));

  const save = async () => {
    setSaved("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    });
    setSaved(res.ok ? "done" : "err");
    if (res.ok) router.refresh();
    setTimeout(() => setSaved("idle"), 2500);
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pt-12 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[0.02em]">Config</h1>
        </div>
        <button onClick={logout} className="text-[0.75rem] tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]">
          SIGN OUT
        </button>
      </div>
      <p className="mt-2 text-[0.75rem] text-[var(--muted)]">
        Store: <b>{data.store}</b>
        {data.store === "memory" &&
          " — set KV_REST_API_URL + KV_REST_API_TOKEN for persistence"}
      </p>

      {/* Sport order */}
      <section className="mt-10">
        <h2 className="eyebrow">Live sport order</h2>
        <p className="mt-1 text-[0.78rem] text-[var(--muted)]">
          Comma-separated slugs, left = first. Seen live now:{" "}
          {data.sports.join(", ") || "none"}
        </p>
        <input
          value={(o.sportOrder ?? []).join(", ")}
          onChange={(e) =>
            setO((c) => ({
              ...c,
              sportOrder: e.target.value
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean),
            }))
          }
          placeholder="soccer, basketball, tennis"
          className="mt-2 w-full rounded border hairline bg-transparent px-3 py-2 text-sm outline-none"
        />
      </section>

      {/* Sections */}
      <section className="mt-10">
        <h2 className="eyebrow">Sections</h2>
        <div className="mt-3 space-y-2">
          {data.sections.map((s) => {
            const ov = sectionOv(s.slug);
            return (
              <div
                key={s.slug}
                className="grid grid-cols-[auto_1fr_4rem_5rem] items-center gap-2 rounded border hairline px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={!ov.hidden}
                  onChange={(e) =>
                    patchSection(s.slug, { hidden: !e.target.checked })
                  }
                  title="Visible"
                />
                <input
                  value={ov.title ?? s.title}
                  onChange={(e) => patchSection(s.slug, { title: e.target.value })}
                  className="min-w-0 bg-transparent outline-none"
                />
                <input
                  type="number"
                  value={ov.order ?? ""}
                  placeholder="ord"
                  onChange={(e) =>
                    patchSection(s.slug, {
                      order: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full bg-transparent text-center outline-none"
                />
                <select
                  value={ov.layout ?? ""}
                  onChange={(e) =>
                    patchSection(s.slug, {
                      layout: (e.target.value || undefined) as
                        | "rail"
                        | "grid"
                        | undefined,
                    })
                  }
                  className="bg-transparent text-[0.75rem] outline-none"
                >
                  <option value="">auto</option>
                  <option value="rail">rail</option>
                  <option value="grid">grid</option>
                </select>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured pins */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Featured video id/slug</span>
          <input
            value={o.featuredVideoId ?? ""}
            onChange={(e) =>
              setO((c) => ({ ...c, featuredVideoId: e.target.value }))
            }
            className="mt-2 w-full rounded border hairline bg-transparent px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Featured live id/slug</span>
          <input
            value={o.featuredLiveId ?? ""}
            onChange={(e) =>
              setO((c) => ({ ...c, featuredLiveId: e.target.value }))
            }
            className="mt-2 w-full rounded border hairline bg-transparent px-3 py-2 text-sm outline-none"
          />
        </label>
      </section>

      <div className="sticky bottom-0 mt-10 flex items-center gap-3 border-t hairline bg-[var(--bg)] py-4">
        <button onClick={save} className="tsl-btn tsl-btn-solid">
          {saved === "saving" ? "Saving…" : "Save"}
        </button>
        {saved === "done" && (
          <span className="text-sm text-green-600">Saved</span>
        )}
        {saved === "err" && (
          <span className="text-sm text-red-600">Failed</span>
        )}
        <button
          onClick={() => setO({})}
          className="text-[0.75rem] tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          RESET ALL
        </button>
      </div>
    </div>
  );
}

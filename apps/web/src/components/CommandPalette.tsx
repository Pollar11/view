"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Section } from "@/lib/types";

type Item = { label: string; hint?: string; href: string };

export function CommandPalette({
  sections,
}: {
  sections: Pick<Section, "slug" | "title">[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(
    () => [
      { label: "Live now", hint: "sports", href: "/live" },
      { label: "Scores", hint: "score-only", href: "/scores" },
      { label: "Multiview", hint: "4-up", href: "/multiview" },
      { label: "Watchlist", hint: "saved", href: "/watchlist" },
      { label: "Search", href: "/search" },
      { label: "Home", href: "/" },
      ...["soccer", "basketball", "tennis", "cricket", "motorsport"].map((s) => ({
        label: s[0].toUpperCase() + s.slice(1),
        hint: "live sport",
        href: `/live?sport=${s}`,
      })),
      ...sections.map((s) => ({
        label: s.title,
        hint: "section",
        href: `/s/${s.slug}`,
      })),
    ],
    [sections],
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) =>
      (it.label + " " + (it.hint ?? "")).toLowerCase().includes(t),
    );
  }, [q, items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border hairline bg-[var(--bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setI(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown")
              setI((v) => Math.min(v + 1, results.length - 1));
            if (e.key === "ArrowUp") setI((v) => Math.max(v - 1, 0));
            if (e.key === "Enter" && results[i]) go(results[i].href);
          }}
          placeholder="Jump to a section, sport, or page…"
          className="w-full bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-[var(--muted)]"
        />
        <ul className="max-h-[52vh] overflow-y-auto border-t hairline py-1">
          {results.map((it, idx) => (
            <li key={it.href}>
              <button
                onMouseEnter={() => setI(idx)}
                onClick={() => go(it.href)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                  idx === i ? "bg-[var(--panel)]" : ""
                }`}
              >
                <span>{it.label}</span>
                {it.hint && (
                  <span className="eyebrow !text-[0.62rem]">{it.hint}</span>
                )}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
              No matches
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

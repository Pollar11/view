"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { LivePreview } from "@/components/live/LivePreview";
import { matchClock } from "@/lib/format";
import type { LiveEvent } from "@/lib/types";

const MAX = 4;
const fetcher = (u: string) =>
  fetch(u).then((r) => r.json() as Promise<{ items: LiveEvent[] }>);

function MultiviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedIds = useMemo(
    () => (params.get("e") ?? "").split(",").filter(Boolean).slice(0, MAX),
    [params],
  );
  const [audioId, setAudioId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data } = useSWR("/api/live?status=live", fetcher, {
    refreshInterval: 20000,
  });
  const all = data?.items ?? [];
  const selected = selectedIds
    .map((id) => all.find((e) => e.id === id || e.slug === id))
    .filter(Boolean) as LiveEvent[];

  const setSelected = useCallback(
    (ids: string[]) => {
      const qs = ids.length ? `?e=${ids.join(",")}` : "";
      router.replace(`/multiview${qs}`);
    },
    [router],
  );

  const toggle = (e: LiveEvent) => {
    const has = selectedIds.includes(e.id);
    if (has) setSelected(selectedIds.filter((x) => x !== e.id));
    else if (selectedIds.length < MAX) setSelected([...selectedIds, e.id]);
  };

  const cols = selected.length <= 1 ? 1 : 2;

  return (
    <div className="px-3 pt-4 md:px-5">
      <div className="mx-auto flex max-w-rail items-center justify-between">
        <div>
          <p className="eyebrow">Multiview</p>
          <h1 className="mt-1 text-xl font-medium tracking-[0.03em]">
            {selected.length} / {MAX} streams
          </h1>
        </div>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="tsl-btn tsl-btn-ghost"
        >
          {pickerOpen ? "Done" : "Add / remove"}
        </button>
      </div>

      {(pickerOpen || selected.length === 0) && (
        <div className="mx-auto mt-4 max-w-rail rounded-lg border hairline p-3">
          {all.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted)]">
              Nothing live to combine right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {all.map((e) => {
                const on = selectedIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggle(e)}
                    disabled={!on && selectedIds.length >= MAX}
                    className={`rounded-md border p-2 text-left text-[0.78rem] transition-colors disabled:opacity-40 ${
                      on
                        ? "border-transparent bg-[var(--fg)] text-[var(--bg)]"
                        : "hairline hover:border-[var(--fg)]"
                    }`}
                  >
                    <span className="block truncate font-medium">
                      {e.home && e.away ? `${e.home} v ${e.away}` : e.title}
                    </span>
                    <span className="block truncate opacity-70">
                      {e.competition ?? e.sportLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div
          className="mx-auto mt-4 grid max-w-rail gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {selected.map((e) => {
            const withAudio = audioId === e.id;
            return (
              <div
                key={e.id}
                className={`relative overflow-hidden rounded-lg bg-black ring-2 ${
                  withAudio ? "ring-red-600" : "ring-transparent"
                }`}
              >
                <LivePreview
                  sources={
                    e.previewSource ? [e.previewSource, ...e.sources] : e.sources
                  }
                  poster={e.thumbnail}
                  active
                  withAudio={withAudio}
                  className="aspect-video w-full"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                  <span className="truncate text-[0.78rem] font-medium">
                    {e.home && e.away ? `${e.home} ${e.score?.home ?? ""}–${e.score?.away ?? ""} ${e.away}` : e.title}
                    <span className="ml-2 text-red-400">
                      {matchClock(e.startsAt)}
                    </span>
                  </span>
                  <button
                    onClick={() => setAudioId(withAudio ? null : e.id)}
                    className="ml-2 shrink-0 rounded bg-white/15 px-2 py-0.5 text-[0.7rem] backdrop-blur-sm hover:bg-white/25"
                  >
                    {withAudio ? "Muted" : "Audio"}
                  </button>
                </div>
                <Link
                  href={`/live/${e.slug ?? e.id}`}
                  className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[0.7rem] text-white backdrop-blur-sm"
                >
                  Full ›
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MultiviewPage() {
  return (
    <Suspense fallback={<div className="p-10" />}>
      <MultiviewInner />
    </Suspense>
  );
}

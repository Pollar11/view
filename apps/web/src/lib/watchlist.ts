"use client";

import { useCallback, useEffect, useState } from "react";

export type WatchlistItem = {
  id: string;
  type: "video" | "live";
  title: string;
  href: string;
  thumbnail?: string;
  subtitle?: string;
  addedAt: number;
};

const KEY = "view:watchlist:v1";
const EVT = "view:watchlist-changed";

function read(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(items: WatchlistItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* private mode / quota — ignore */
  }
  window.dispatchEvent(new Event(EVT));
}

export function toggleWatchlist(item: Omit<WatchlistItem, "addedAt">) {
  const items = read();
  const idx = items.findIndex((i) => i.id === item.id && i.type === item.type);
  if (idx >= 0) items.splice(idx, 1);
  else items.unshift({ ...item, addedAt: Date.now() });
  write(items);
  return idx < 0; // true = added
}

export function removeFromWatchlist(id: string, type: WatchlistItem["type"]) {
  write(read().filter((i) => !(i.id === id && i.type === type)));
}

/** Subscribe to the whole list. */
export function useWatchlist(): WatchlistItem[] {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}

/** Membership + toggle for a single item. */
export function useWatchlistItem(id: string, type: WatchlistItem["type"]) {
  const list = useWatchlist();
  const saved = list.some((i) => i.id === id && i.type === type);
  const toggle = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => toggleWatchlist(item),
    [],
  );
  return { saved, toggle };
}

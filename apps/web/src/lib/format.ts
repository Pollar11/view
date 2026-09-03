export function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatViews(n?: number): string {
  if (n == null) return "";
  if (n < 1000) return `${n} views`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K views`;
  return `${(n / 1_000_000).toFixed(1)}M views`;
}

/** "32'" style match clock from a kickoff timestamp (soccer-ish). */
export function matchClock(startsAt?: string): string {
  if (!startsAt) return "LIVE";
  const mins = Math.floor((Date.now() - new Date(startsAt).getTime()) / 60000);
  if (Number.isNaN(mins) || mins < 0) return "LIVE";
  if (mins <= 45) return `${mins}'`;
  if (mins < 60) return "HT";
  if (mins <= 105) return `${mins - 15}'`;
  return "LIVE";
}

/** "in 45m" / "in 2h 10m" until a future timestamp. */
export function timeUntil(iso?: string): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "now";
  const m = Math.round(ms / 60000);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  return `in ${h}h ${m % 60}m`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

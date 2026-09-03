import { config } from "./config";
import type { LiveEvent } from "./types";

function rankIn(order: string[], slug: string): number {
  const i = order.indexOf(slug.toLowerCase());
  return i === -1 ? order.length + 1 : i;
}

export type SportGroup = {
  sport: string;
  label: string;
  events: LiveEvent[];
};

/**
 * Group events by sport and order them: config.sportOrder first (soccer by
 * default), the rest alphabetically. Within a group: live before upcoming,
 * then by viewers, then by kickoff.
 */
export function groupLiveBySport(
  events: LiveEvent[],
  order: string[] = config.sportOrder,
): SportGroup[] {
  const byStatus = { live: 0, upcoming: 1, ended: 2 } as const;
  const map = new Map<string, SportGroup>();

  for (const e of events) {
    const g = map.get(e.sport) ?? {
      sport: e.sport,
      label: e.sportLabel || titleCase(e.sport),
      events: [],
    };
    g.events.push(e);
    map.set(e.sport, g);
  }

  for (const g of map.values()) {
    g.events.sort(
      (a, b) =>
        byStatus[a.status] - byStatus[b.status] ||
        (b.viewers ?? 0) - (a.viewers ?? 0) ||
        new Date(a.startsAt ?? 0).getTime() -
          new Date(b.startsAt ?? 0).getTime(),
    );
  }

  return [...map.values()].sort(
    (a, b) =>
      rankIn(order, a.sport) - rankIn(order, b.sport) ||
      a.label.localeCompare(b.label),
  );
}

export function titleCase(slug: string): string {
  return slug.replace(/(^|[\s-])\S/g, (c) => c.toUpperCase());
}

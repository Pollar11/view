const STORAGE_KEY = "mm_recently_viewed";
const MAX_ITEMS = 8;

/** Product slugs only — never a name, address, or anything identifying the
 * viewer — kept in this browser's localStorage alone, never sent anywhere. */
export function recordProductView(slug: string): void {
  try {
    const existing = loadRecentlyViewed().filter((s) => s !== slug);
    const next = [slug, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage can throw in private-browsing/storage-restricted
    // contexts — losing this convenience isn't worth failing for.
  }
}

export function loadRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

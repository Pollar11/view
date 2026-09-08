const STORAGE_KEY = "mm_utm";
const UTM_PARAMS = ["source", "medium", "campaign", "term", "content"] as const;

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/** Reads utm_* query params on the current page and persists them for the
 * session (first-touch: won't overwrite an already-stored campaign with a
 * plain, param-less page view later in the same visit). Call once on
 * mount from a client component. */
export function captureUtmFromLocation(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  let any = false;
  for (const key of UTM_PARAMS) {
    const v = params.get(`utm_${key}`);
    if (v) {
      found[key] = v.slice(0, 100);
      any = true;
    }
  }
  if (any) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch {
      // sessionStorage unavailable — attribution simply won't be recorded this visit.
    }
  }
}

export function getStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : null;
  } catch {
    return null;
  }
}

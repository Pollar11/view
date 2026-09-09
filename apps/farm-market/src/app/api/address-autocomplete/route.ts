import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { haversineMiles } from "@/lib/geo";
import { FARM_COORDS } from "@/lib/site";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  state?: string;
  postcode?: string;
  country_code?: string;
}

interface NominatimResult {
  display_name: string;
  address?: NominatimAddress;
  lat: string;
  lon: string;
}

interface CacheEntry {
  suggestions: unknown;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __farmMarketAddressCache: Map<string, CacheEntry> | undefined;
}

function cacheStore(): Map<string, CacheEntry> {
  if (!global.__farmMarketAddressCache) {
    global.__farmMarketAddressCache = new Map();
  }
  return global.__farmMarketAddressCache;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

/** ~6 degrees around the farm in every direction — comfortably covers the
 * whole 320 mile service radius. Passed to Nominatim as a soft bias
 * (bounded=0), not a hard filter, so addresses outside it still appear,
 * just ranked lower once we sort by real distance below. */
const VIEWBOX = [
  FARM_COORDS.lon - 6,
  FARM_COORDS.lat + 6,
  FARM_COORDS.lon + 6,
  FARM_COORDS.lat - 6,
].join(",");

const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};

/**
 * Free address autocomplete via Nominatim (OpenStreetMap's geocoding
 * search) — no API key needed, unlike Google Places. Proxied through our
 * own route rather than called from the browser because Nominatim's usage
 * policy requires a real identifying User-Agent header, which fetch() from
 * a browser can't set, plus this lets us rate-limit it ourselves.
 */
export async function GET(req: Request) {
  if (!rateLimit(req, "address-autocomplete", { limit: 40, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const cacheKey = q.toLowerCase();
  const cached = cacheStore().get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ suggestions: cached.suggestions });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("limit", "10");
    // Soft-biases results toward the farm's delivery region so nearby
    // matches surface even from a short, ambiguous query — we still sort
    // by real distance below rather than trusting this ranking alone.
    url.searchParams.set("viewbox", VIEWBOX);
    url.searchParams.set("bounded", "0");

    const res = await fetch(url, {
      headers: {
        // Required by Nominatim's usage policy — identifies the app, not a
        // secret. https://operations.osmfoundation.org/policies/nominatim/
        "User-Agent": "MeadowAndMarketDemo/1.0 (farm-to-door storefront demo)",
        "Accept-Language": "en-US",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });

    const results = (await res.json()) as NominatimResult[];
    const suggestions = results
      .map((r) => {
        const a = r.address;
        if (!a) return null;
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const city = a.city || a.town || a.village || a.hamlet;
        const stateName = a.state?.toLowerCase();
        const state = stateName ? STATE_ABBREVIATIONS[stateName] ?? a.state : undefined;
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        if (!street || !city || !state || !a.postcode || Number.isNaN(lat) || Number.isNaN(lon)) {
          return null;
        }
        return {
          label: r.display_name,
          street,
          city,
          state,
          zip: a.postcode.slice(0, 5),
          distanceMiles: Math.round(haversineMiles(FARM_COORDS.lat, FARM_COORDS.lon, lat, lon)),
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      // Closest to the farm first — real great-circle distance, not
      // Nominatim's internal relevance ranking.
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 6);

    cacheStore().set(cacheKey, { suggestions, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}

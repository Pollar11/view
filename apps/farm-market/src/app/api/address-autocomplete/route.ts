import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

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
}

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
  if (!rateLimit(req, "address-autocomplete", { limit: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 4) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("limit", "5");

    const res = await fetch(url, {
      headers: {
        // Required by Nominatim's usage policy — identifies the app, not a
        // secret. https://operations.osmfoundation.org/policies/nominatim/
        "User-Agent": "MeadowAndMarketDemo/1.0 (farm-to-door storefront demo)",
        "Accept-Language": "en-US",
      },
      signal: AbortSignal.timeout(5000),
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
        if (!street || !city || !state || !a.postcode) return null;
        return {
          label: r.display_name,
          street,
          city,
          state,
          zip: a.postcode.slice(0, 5),
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}

export const FARM_NAME = "Meadow & Market";

/** Bump whenever privacy.tsx or terms/page.tsx content actually changes. */
export const LEGAL_LAST_UPDATED = "September 8, 2026";

export const FARM_TAGLINE =
  "Pasture-raised sheep, goat, beef, chicken, duck, rabbit, and eggs — cut to order and delivered to your door.";

/** Canonical site origin for metadata, sitemap, and OG tags. Set
 * NEXT_PUBLIC_SITE_URL once a real domain/preview URL exists; falls back to
 * localhost for dev so nothing crashes before that's configured. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3100";

export const FARM_ADDRESS = {
  street: "845 Kennedy St",
  city: "Oakland",
  state: "CA",
  zip: "94606",
};

export const FARM_ADDRESS_LABEL = `${FARM_ADDRESS.street}, ${FARM_ADDRESS.city}, ${FARM_ADDRESS.state} ${FARM_ADDRESS.zip}`;

export const FARM_PHONE = "(510) 535-1111";
export const FARM_PHONE_TEL = "+15105351111";

/** Demo contact address — swap for a real monitored inbox before launch. */
export const FARM_EMAIL = "hello@meadowandmarket.com";

/** Demo social links — point at the platform's home page as an honest
 * placeholder (no real account exists yet). Swap for real profile URLs
 * once they're created. */
export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://instagram.com", icon: "instagram" as const },
  { name: "Facebook", url: "https://facebook.com", icon: "facebook" as const },
  { name: "X", url: "https://x.com", icon: "x" as const },
];

export const FARM_HOURS = [
  { day: "Mon–Fri", hours: "8:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FARM_ADDRESS_LABEL,
)}`;

/** Rough coordinates for the Fruitvale/San Antonio area of Oakland, CA
 * (94606) — used to center the embedded map and, in address-autocomplete,
 * to rank results by real distance from the farm; not asserted as an exact
 * geocode of the street address. */
export const FARM_COORDS = { lat: 37.782, lon: -122.23 };

export const FARM_MAP_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=-122.2450%2C37.7720%2C-122.2150%2C37.7920&layer=mapnik&marker=37.7820%2C-122.2300";

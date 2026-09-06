export const FARM_NAME = "Meadow & Market";

export const FARM_ADDRESS = {
  street: "845 Kennedy St",
  city: "Oakland",
  state: "CA",
  zip: "94606",
};

export const FARM_ADDRESS_LABEL = `${FARM_ADDRESS.street}, ${FARM_ADDRESS.city}, ${FARM_ADDRESS.state} ${FARM_ADDRESS.zip}`;

export const FARM_PHONE = "(510) 535-1111";
export const FARM_PHONE_TEL = "+15105351111";

export const FARM_HOURS = [
  { day: "Mon–Fri", hours: "8:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FARM_ADDRESS_LABEL,
)}`;

/** Rough coordinates for the Fruitvale/San Antonio area of Oakland, CA
 * (94606) — used only to center the embedded map, not asserted as an
 * exact geocode of the street address. */
export const FARM_MAP_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=-122.2450%2C37.7720%2C-122.2150%2C37.7920&layer=mapnik&marker=37.7820%2C-122.2300";

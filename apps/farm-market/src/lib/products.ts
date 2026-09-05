import type { Product } from "./types";

/**
 * Product photos are hotlinked from Wikimedia Commons via the stable
 * Special:FilePath redirect (so the URL never breaks even if the underlying
 * upload path changes), all free-to-use / openly licensed. Full credit +
 * license is shown in the site footer's "Photo credits" panel.
 */
const img = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;

export const CATALOG: Product[] = [
  {
    slug: "pasture-ewe",
    name: "Pasture-Raised Ewe",
    category: "sheep",
    unitType: "per_lb",
    pricePerLb: 4.99,
    unitNoun: "lb",
    portionOptions: [
      { label: "Quarter (~10 lb)", weightLb: 10 },
      { label: "Half (~20 lb)", weightLb: 20 },
      { label: "Whole (~40 lb)", weightLb: 40 },
    ],
    baseStock: 14,
    image: img("Sheep.jpg"),
    imageAlt: "A pasture-raised ewe standing in a green field",
    imageCredit: {
      title: "Sheep.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Sheep.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Grass-fed ewe, dressed and cut to order. Mild, tender lamb/mutton raised on open pasture, no feedlots.",
    bullets: [
      "Grass-fed, pasture-raised — never a feedlot",
      "Cut into quarter, half, or whole portions",
      "Vacuum-sealed and flash-frozen for delivery",
    ],
    marketNote:
      "$4.99/lb sits at the value end of the regional lamb & mutton market, where whole/half-animal direct-from-farm pricing typically runs $4.50–$7.50/lb versus $9–$14/lb for retail cuts.",
  },
  {
    slug: "hill-goat",
    name: "Hill-Raised Goat",
    category: "goat",
    unitType: "per_lb",
    pricePerLb: 5.99,
    unitNoun: "lb",
    portionOptions: [
      { label: "Quarter (~7 lb)", weightLb: 7 },
      { label: "Half (~14 lb)", weightLb: 14 },
      { label: "Whole (~28 lb)", weightLb: 28 },
    ],
    baseStock: 9,
    image: img("Goat.jpg"),
    imageAlt: "A goat standing on a hillside pasture",
    imageCredit: {
      title: "Goat.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Goat.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Free-range goat (chevon), lean and flavorful. A staple for curries, stews, and grilling.",
    bullets: [
      "Free-range, rotationally grazed",
      "Lean meat — lower fat than lamb or beef",
      "Cut into quarter, half, or whole portions",
    ],
    marketNote:
      "$5.99/lb tracks current chevon/goat-meat averages, which run noticeably above lamb ($6–$9/lb direct-from-farm) due to steady demand outpacing US goat supply.",
  },
  {
    slug: "farm-chicken",
    name: "Whole Farm Chicken",
    category: "chicken",
    unitType: "per_unit",
    pricePerUnit: 13,
    unitNoun: "chicken",
    avgWeightLb: 4.2,
    baseStock: 26,
    image: img("Free_range_chicken_flock.jpg"),
    imageAlt: "Free-range chickens foraging outdoors",
    imageCredit: {
      title: "Free range chicken flock.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Free_range_chicken_flock.jpg",
      license: "CC BY 2.0",
    },
    description:
      "Whole free-range chicken, roughly 4 lb dressed. Pasture-raised, no antibiotics.",
    bullets: [
      "Free-range, foraged pasture diet",
      "No antibiotics, no added hormones",
      "Ready to roast — about 4 lb average",
    ],
    marketNote:
      "$13/chicken works out to roughly $3.10/lb on a ~4.2 lb bird — in line with free-range whole-chicken pricing, well under the $5–$7/lb charged for organic/heritage breeds.",
  },
  {
    slug: "farm-eggs-dozen",
    name: "Farm-Fresh Eggs (Dozen)",
    category: "eggs",
    unitType: "per_unit",
    pricePerUnit: 12,
    unitNoun: "dozen",
    baseStock: 40,
    image: img("Carton_of_eggs.jpg"),
    imageAlt: "An open carton of a dozen fresh brown eggs",
    imageCredit: {
      title: "Carton of eggs.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Carton_of_eggs.jpg",
      license: "CC BY 3.0",
    },
    description:
      "A dozen free-range eggs, collected fresh and delivered within days, not weeks.",
    bullets: [
      "Collected within 72 hours of delivery",
      "Free-range hens, foraged diet",
      "Mixed medium-to-large sizing",
    ],
    marketNote:
      "$12/dozen reflects current pasture-raised/free-range egg pricing, which trades at a premium over commodity cartons in exchange for freshness and hen welfare.",
  },
  {
    slug: "farm-duck",
    name: "Whole Farm Duck",
    category: "duck",
    unitType: "per_lb",
    pricePerLb: 7.99,
    unitNoun: "lb",
    avgWeightLb: 5,
    baseStock: 11,
    image: img("Duck.jpg"),
    imageAlt: "A duck standing outdoors",
    imageCredit: {
      title: "Duck.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Duck.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Whole pasture-raised duck, about 5 lb dressed. Rich, dark meat — a favorite for roasting.",
    bullets: [
      "Pasture-raised, pond access",
      "Whole bird, ~5 lb average dressed weight",
      "Great for roasting or confit",
    ],
    marketNote:
      "New to the farm this season. $7.99/lb is set against current specialty/farm-duck market rates ($7–$10/lb direct), above commodity supermarket duck ($3.50–$5/lb) which is mass-produced, not pasture-raised.",
  },
  {
    slug: "farm-rabbit",
    name: "Whole Farm Rabbit",
    category: "rabbit",
    unitType: "per_lb",
    pricePerLb: 8.99,
    unitNoun: "lb",
    avgWeightLb: 3.5,
    baseStock: 8,
    image: img("White_rabbit.JPG"),
    imageAlt: "A white domestic rabbit",
    imageCredit: {
      title: "White rabbit.JPG",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:White_rabbit.JPG",
      license: "Wikimedia Commons",
    },
    description:
      "Whole farm-raised rabbit, about 3.5 lb dressed. Lean, mild white meat.",
    bullets: [
      "Farm-raised meat rabbit breeds",
      "Lean, high-protein white meat",
      "Whole bird, ~3.5 lb average dressed weight",
    ],
    marketNote:
      "New to the farm this season. $8.99/lb matches current specialty meat-rabbit pricing ($8–$10/lb direct-from-farm) — rabbit remains a premium/niche meat in the US with limited supply.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

export const CATEGORY_LABELS: Record<Product["category"], string> = {
  sheep: "Sheep & Lamb",
  goat: "Goat",
  chicken: "Chicken",
  eggs: "Eggs",
  duck: "Duck",
  rabbit: "Rabbit",
};

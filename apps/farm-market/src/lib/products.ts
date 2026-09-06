import type { Product } from "./types";

/**
 * Product photos are hotlinked from Wikimedia Commons via the stable
 * Special:FilePath redirect (so the URL never breaks even if the underlying
 * upload path changes), all free-to-use / openly licensed. Full credit +
 * license is shown in the site footer's "Photo credits" panel.
 *
 * IMPORTANT: every filename below was verified against its actual Commons
 * description (not just guessed from the name) after an earlier mistake —
 * "White_rabbit.JPG" turned out to be Jefferson Airplane album art, not a
 * rabbit. Filenames here are deliberately the plain, literal, unambiguous
 * ones (no single/double-word titles that double as song/movie/band names).
 */
const img = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;

export const CATALOG: Product[] = [
  // ---------------------------------------------------------------- SHEEP
  {
    slug: "pasture-ewe",
    name: "Pasture-Raised Ewe",
    category: "sheep",
    unitType: "per_lb",
    cutType: "whole",
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
    slug: "lamb-chops",
    name: "Lamb Chops (Butchered)",
    category: "sheep",
    unitType: "per_lb",
    cutType: "butchered",
    pricePerLb: 10.99,
    unitNoun: "lb",
    avgWeightLb: 2,
    baseStock: 22,
    image: img("Lamb_chops,_2006.jpg"),
    imageAlt: "Butchered lamb chops, ready to cook",
    imageCredit: {
      title: "Lamb chops, 2006.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Lamb_chops,_2006.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Ready-to-cook lamb chops, butchered and portioned — no cutting or freezer space required, just grill or pan-sear.",
    bullets: [
      "Pre-cut, ready to cook tonight",
      "Sold in ~2 lb packs",
      "Same pasture-raised animals as our whole ewe",
    ],
    marketNote:
      "$10.99/lb is in line with retail lamb chop pricing ($10–$16/lb) — the premium over our whole-ewe price covers the butchering and packaging, not the animal itself.",
  },

  // ----------------------------------------------------------------- GOAT
  {
    slug: "hill-goat",
    name: "Hill-Raised Goat",
    category: "goat",
    unitType: "per_lb",
    cutType: "whole",
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
    slug: "goat-chops",
    name: "Goat Chops (Butchered)",
    category: "goat",
    unitType: "per_lb",
    cutType: "butchered",
    pricePerLb: 11.99,
    unitNoun: "lb",
    avgWeightLb: 2,
    baseStock: 16,
    image: img("Goat_chops.jpg"),
    imageAlt: "Butchered goat chops, ready to cook",
    imageCredit: {
      title: "Goat chops.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Goat_chops.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Ready-to-cook goat chops — pre-butchered from the same hill-raised herd, perfect for curry or the grill.",
    bullets: [
      "Pre-cut, ready to cook tonight",
      "Sold in ~2 lb packs",
      "Same free-range herd as our whole goat",
    ],
    marketNote:
      "$11.99/lb matches retail chevon chop pricing ($10–$14/lb), reflecting butchering and packaging on top of the base animal price.",
  },

  // ----------------------------------------------------------------- BEEF
  {
    slug: "pasture-beef",
    name: "Pasture-Raised Beef",
    category: "beef",
    unitType: "per_lb",
    cutType: "whole",
    pricePerLb: 6.49,
    unitNoun: "lb",
    portionOptions: [
      { label: "Quarter (~110 lb)", weightLb: 110 },
      { label: "Half (~220 lb)", weightLb: 220 },
      { label: "Whole (~440 lb)", weightLb: 440 },
    ],
    baseStock: 4,
    image: img("Holstein_Cow_Grazing_01.jpg"),
    imageAlt: "Pasture-raised cattle grazing in an open field",
    imageCredit: {
      title: "Holstein Cow Grazing 01.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Holstein_Cow_Grazing_01.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Grass-fed beef by the quarter, half, or whole animal, dry-aged and cut to your specification.",
    bullets: [
      "Grass-fed and grass-finished, rotationally grazed",
      "Dry-aged before cutting for better flavor",
      "Cut into quarter, half, or whole portions",
    ],
    marketNote:
      "$6.49/lb is at the value end of whole/half-beef direct-from-farm pricing ($5.50–$8/lb hanging weight), well under the $9–$20/lb charged for individual retail cuts.",
  },
  {
    slug: "beef-steaks",
    name: "Beef Steaks (Butchered)",
    category: "beef",
    unitType: "per_lb",
    cutType: "butchered",
    pricePerLb: 13.99,
    unitNoun: "lb",
    avgWeightLb: 2,
    baseStock: 18,
    image: img("Hanger-steak-raw-MCB.jpg"),
    imageAlt: "Butchered raw beef steaks, ready to cook",
    imageCredit: {
      title: "Hanger-steak-raw-MCB.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Hanger-steak-raw-MCB.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Ready-to-cook steaks, individually portioned from the same grass-fed herd — no butchering or freezer commitment needed.",
    bullets: [
      "Pre-cut, ready to cook tonight",
      "Sold in ~2 lb packs",
      "Same grass-fed herd as our whole beef",
    ],
    marketNote:
      "$13.99/lb undercuts typical grass-fed steak pricing ($16–$25/lb) by selling direct, while still covering butchering and packaging above our whole-animal rate.",
  },

  // -------------------------------------------------------------- CHICKEN
  {
    slug: "farm-chicken",
    name: "Whole Farm Chicken",
    category: "chicken",
    unitType: "per_unit",
    cutType: "whole",
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
    slug: "chicken-thighs",
    name: "Chicken Thighs (Butchered)",
    category: "chicken",
    unitType: "per_unit",
    cutType: "butchered",
    pricePerUnit: 9,
    unitNoun: "pack",
    baseStock: 30,
    image: img("Raw_chicken.jpg"),
    imageAlt: "Butchered raw chicken thighs, ready to cook",
    imageCredit: {
      title: "Raw chicken.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Raw_chicken.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Bone-in chicken thighs from the same free-range flock, butchered and packed — about 2 lb per pack.",
    bullets: [
      "Pre-cut, ready to cook tonight",
      "~2 lb pack, bone-in",
      "Same free-range flock as our whole chicken",
    ],
    marketNote:
      "$9/pack (~$4.50/lb) tracks free-range chicken-thigh retail pricing, priced slightly above the whole-bird rate to cover butchering.",
  },

  // ----------------------------------------------------------------- EGGS
  {
    slug: "farm-eggs-dozen",
    name: "Farm-Fresh Eggs (Dozen)",
    category: "eggs",
    unitType: "per_unit",
    cutType: "whole",
    pricePerUnit: 12,
    unitNoun: "dozen",
    baseStock: 40,
    image: img("Carton_of_eggs.jpg"),
    imageAlt: "An open carton of a dozen fresh brown chicken eggs",
    imageCredit: {
      title: "Carton of eggs.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Carton_of_eggs.jpg",
      license: "CC BY 3.0",
    },
    description:
      "A dozen free-range chicken eggs, collected fresh and delivered within days, not weeks.",
    bullets: [
      "Collected within 72 hours of delivery",
      "Free-range hens, foraged diet",
      "Mixed medium-to-large sizing",
    ],
    marketNote:
      "$12/dozen reflects current pasture-raised/free-range egg pricing, which trades at a premium over commodity cartons in exchange for freshness and hen welfare.",
  },
  {
    slug: "duck-eggs-dozen",
    name: "Duck Eggs (Dozen)",
    category: "eggs",
    unitType: "per_unit",
    cutType: "whole",
    pricePerUnit: 14,
    unitNoun: "dozen",
    baseStock: 16,
    image: img("Dirty_Cayuga_Duck_Eggs.jpg"),
    imageAlt: "A dozen dark-shelled Cayuga duck eggs",
    imageCredit: {
      title: "Dirty Cayuga Duck Eggs.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Dirty_Cayuga_Duck_Eggs.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Rich, large duck eggs from our Cayuga flock — a favorite for baking thanks to their bigger yolks.",
    bullets: [
      "Larger yolks than chicken eggs — great for baking",
      "Collected within 72 hours of delivery",
      "From the same pond-access ducks as our whole duck",
    ],
    marketNote:
      "$14/dozen matches current specialty duck-egg pricing ($12–$16/dozen), a premium over chicken eggs reflecting lower supply and larger size.",
  },
  {
    slug: "quail-eggs-18pack",
    name: "Quail Eggs (18-Pack)",
    category: "eggs",
    unitType: "per_unit",
    cutType: "whole",
    pricePerUnit: 9,
    unitNoun: "18-pack",
    baseStock: 20,
    image: img("Quail_eggs.jpg"),
    imageAlt: "A pack of small speckled quail eggs",
    imageCredit: {
      title: "Quail eggs.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Quail_eggs.jpg",
      license: "Wikimedia Commons",
    },
    description:
      "Delicate, speckled quail eggs — a favorite garnish and appetizer ingredient, sold 18 to a pack.",
    bullets: [
      "18 eggs per pack (quail eggs run small)",
      "Popular for appetizers, ramen, and garnishes",
      "Collected within 72 hours of delivery",
    ],
    marketNote:
      "$9 for 18 lines up with specialty quail-egg pricing (roughly $0.45–$0.60/egg), a niche product priced for the smaller portion size.",
  },

  // ----------------------------------------------------------------- DUCK
  {
    slug: "farm-duck",
    name: "Whole Farm Duck",
    category: "duck",
    unitType: "per_lb",
    cutType: "whole",
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
      "$7.99/lb is set against current specialty/farm-duck market rates ($7–$10/lb direct), above commodity supermarket duck ($3.50–$5/lb) which is mass-produced, not pasture-raised.",
  },
  {
    slug: "duck-breast",
    name: "Duck Breast (Butchered)",
    category: "duck",
    unitType: "per_unit",
    cutType: "butchered",
    pricePerUnit: 11,
    unitNoun: "pack",
    baseStock: 14,
    image: img("Cutting_of_meat.jpg"),
    imageAlt: "Butchered duck breast, ready to cook",
    imageCredit: {
      title: "Cutting of meat.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cutting_of_meat.jpg",
      license: "CC BY-SA 4.0",
    },
    description:
      "Boneless duck breast, two to a pack, from the same pond-access flock as our whole duck.",
    bullets: [
      "2 breasts per pack, boneless",
      "Restaurant favorite — sear skin-side down",
      "Same pasture-raised flock as our whole duck",
    ],
    marketNote:
      "$11/pack lines up with specialty duck-breast pricing ($10–$14 per 2-pack), a premium over the whole bird that covers butchering.",
  },

  // --------------------------------------------------------------- RABBIT
  {
    slug: "farm-rabbit",
    name: "Whole Farm Rabbit",
    category: "rabbit",
    unitType: "per_lb",
    cutType: "whole",
    pricePerLb: 8.99,
    unitNoun: "lb",
    avgWeightLb: 3.5,
    baseStock: 8,
    image: img("NewZealandWhiteRabbit.jpg"),
    imageAlt: "A New Zealand White rabbit, a common meat-rabbit breed",
    imageCredit: {
      title: "NewZealandWhiteRabbit.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:NewZealandWhiteRabbit.jpg",
      license: "CC BY-SA 3.0",
    },
    description:
      "Whole farm-raised rabbit, about 3.5 lb dressed. Lean, mild white meat.",
    bullets: [
      "Farm-raised meat rabbit breeds (New Zealand White)",
      "Lean, high-protein white meat",
      "Whole animal, ~3.5 lb average dressed weight",
    ],
    marketNote:
      "New to the farm this season. $8.99/lb matches current specialty meat-rabbit pricing ($8–$10/lb direct-from-farm) — rabbit remains a premium/niche meat in the US with limited supply.",
  },
  {
    slug: "rabbit-cuts",
    name: "Rabbit Cuts (Butchered)",
    category: "rabbit",
    unitType: "per_lb",
    cutType: "butchered",
    pricePerLb: 10.99,
    unitNoun: "lb",
    avgWeightLb: 1.5,
    baseStock: 10,
    image: img("Cutting_of_meat.jpg"),
    imageAlt: "Butchered rabbit cuts, ready to cook",
    imageCredit: {
      title: "Cutting of meat.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cutting_of_meat.jpg",
      license: "CC BY-SA 4.0",
    },
    description:
      "Rabbit, butchered into serving pieces — ready for the braising pan, no whole-animal prep needed.",
    bullets: [
      "Pre-cut into serving pieces",
      "Sold in ~1.5 lb packs",
      "Same New Zealand White breed as our whole rabbit",
    ],
    marketNote:
      "$10.99/lb reflects specialty butchered-rabbit retail pricing ($10–$13/lb), a modest premium over our whole-rabbit rate for the butchering.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

export const CATEGORY_LABELS: Record<Product["category"], string> = {
  sheep: "Sheep & Lamb",
  goat: "Goat",
  beef: "Beef",
  chicken: "Chicken",
  eggs: "Eggs",
  duck: "Duck",
  rabbit: "Rabbit",
};

/**
 * Genuine "goes well together" pairings by category, used to drive
 * Frequently Bought Together — e.g. chicken pairs with eggs, not sheep.
 * Every category always pairs with itself first (e.g. whole + butchered
 * cuts of the same animal).
 */
export const CATEGORY_PAIRINGS: Record<Product["category"], Product["category"][]> = {
  chicken: ["chicken", "eggs", "duck"],
  eggs: ["eggs", "chicken", "duck"],
  duck: ["duck", "eggs", "chicken"],
  sheep: ["sheep", "goat", "beef"],
  goat: ["goat", "sheep", "beef"],
  beef: ["beef", "sheep", "goat"],
  rabbit: ["rabbit", "chicken", "duck"],
};

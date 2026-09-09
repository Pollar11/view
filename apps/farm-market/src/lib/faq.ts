import { FARM_ADDRESS_LABEL, FARM_HOURS, FARM_PHONE } from "./site";

export interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
}

const HOURS_LINE = FARM_HOURS.map((h) => `${h.day} ${h.hours}`).join(", ");

/**
 * Single source of truth for both the /faq page and the automated
 * assistant widget, so the bot never says anything the FAQ page doesn't
 * already say.
 */
export const FAQ: FaqEntry[] = [
  {
    question: "Where do you deliver?",
    answer:
      "We deliver within about a 320 mile radius of our Oakland, CA farm — that covers most of California and neighboring states, including Anaheim. Enter your ZIP code at checkout for an exact distance and delivery-time estimate.",
    keywords: ["deliver", "delivery area", "ship", "radius", "anaheim", "zip"],
  },
  {
    question: "How much is delivery?",
    answer:
      "Delivery is $6.99, and free automatically once your order (after any discounts) reaches $75. There's no minimum order size otherwise.",
    keywords: ["delivery fee", "shipping cost", "free delivery", "how much", "minimum order", "minimum"],
  },
  {
    question: "How is meat priced — whole animal vs. butchered?",
    answer:
      "Whole/half/quarter animal listings are cut to order and priced per pound at the lower, direct-from-farm rate. Butchered listings (chops, steaks, thighs, breast) are pre-cut and ready to cook, priced a bit higher per pound to cover the butchering and packaging.",
    keywords: ["whole animal", "butchered", "cut to order", "portion", "chops", "steak"],
  },
  {
    question: "Do you offer a subscription?",
    answer:
      "Yes — see the Subscribe page for monthly recurring boxes per animal type, with the delivery fee calculated from your ZIP code just like a one-off order.",
    keywords: ["subscription", "subscribe", "monthly", "recurring", "box"],
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Pay on delivery (cash or card with the driver), or at checkout choose a demo card, Apple Pay, or PayPal — those three are shown for demonstration and don't process a real charge in this environment.",
    keywords: ["payment", "pay", "pay on delivery", "apple pay", "paypal", "cash", "card"],
  },
  {
    question: "Will you text me?",
    answer:
      "Only if you opt in. At checkout there's a separate checkbox for order-confirmation and occasional real-offer texts, and on the cart page you can tap \"Text me this cart\" for a one-time reminder — nothing is sent automatically without your action.",
    keywords: ["text me", "sms", "opt in", "reminder"],
  },
  {
    question: "How fresh is the meat?",
    answer:
      "Animals are processed after you order — nothing sits in a warehouse — and eggs are collected within about 72 hours of delivery.",
    keywords: ["fresh", "freshness", "frozen", "processed"],
  },
  {
    question: "How do I contact a person?",
    answer: `Call the farm directly at ${FARM_PHONE}, or see the Locations page for our address and hours.`,
    keywords: ["contact", "human", "real person", "talk to someone"],
  },
  {
    question: "What are your hours?",
    answer: `We're open ${HOURS_LINE}.`,
    keywords: ["hours", "open", "close", "closed", "weekend"],
  },
  {
    question: "Where are you located?",
    answer: `The farm is at ${FARM_ADDRESS_LABEL}. See the Locations page for directions — we're delivery-only, so a visit isn't required to order.`,
    keywords: ["located", "location", "address", "visit", "directions"],
  },
  {
    question: "What's your return or refund policy?",
    answer: `If an order arrives damaged, incorrect, or below the quality you expect, call ${FARM_PHONE} within 48 hours of delivery and we'll make it right with a replacement or refund.`,
    keywords: ["return", "refund", "satisfaction", "guarantee", "damaged", "wrong order"],
  },
  {
    question: "Do you have discount codes or coupons?",
    answer:
      "Two discounts apply automatically in your cart — 5% off for mixing 2+ animal categories, 10% off for 4+ — no code needed. Opted-in returning customers sometimes get a personal SMS code too, but there's no public sitewide code.",
    keywords: ["discount code", "coupon", "promo code", "deal"],
  },
  {
    question: "Can I pick up my order instead of delivery?",
    answer: "We're delivery-only right now — there's no farm pickup option at checkout.",
    keywords: ["pick up", "pickup", "pick-up", "collect my order"],
  },
  {
    question: "Do you have gift cards?",
    answer: `We don't offer gift cards right now — call ${FARM_PHONE} if you'd like to arrange something special for someone else.`,
    keywords: ["gift card", "gift certificate"],
  },
  {
    question: "Is the meat organic?",
    answer:
      "Our animals are pasture-raised — grass-fed where applicable, no antibiotics or added hormones — but we're not USDA Organic certified. We're upfront about how they're actually raised rather than claiming a certification we don't have.",
    keywords: ["organic", "certified", "certification", "gmo", "hormones", "antibiotics"],
  },
  {
    question: "How do I track my order?",
    answer: `There's no live tracking — your order confirmation page has your delivery estimate. Save that link or your order number, and call ${FARM_PHONE} for a status update.`,
    keywords: ["track my order", "tracking", "order status", "where is my order"],
  },
];

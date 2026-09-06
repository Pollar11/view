export interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
}

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
      "Delivery is $6.99, and free automatically once your order (after any discounts) reaches $75.",
    keywords: ["delivery fee", "shipping cost", "free delivery", "how much"],
  },
  {
    question: "How is meat priced — whole animal vs. butchered?",
    answer:
      "Whole/half/quarter animal listings are cut to order and priced per pound at the lower, direct-from-farm rate. Butchered listings (chops, steaks, thighs, breast) are pre-cut and ready to cook, priced a bit higher per pound to cover the butchering and packaging.",
    keywords: ["whole", "butchered", "cut", "price", "portion", "chops", "steak"],
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
    keywords: ["payment", "pay", "card", "apple pay", "paypal", "cash"],
  },
  {
    question: "Will you text me?",
    answer:
      "Only if you opt in. At checkout there's a separate checkbox for order-confirmation and occasional real-offer texts, and on the cart page you can tap \"Text me this cart\" for a one-time reminder — nothing is sent automatically without your action.",
    keywords: ["text", "sms", "phone", "opt in", "reminder"],
  },
  {
    question: "How fresh is the meat?",
    answer:
      "Animals are processed after you order — nothing sits in a warehouse — and eggs are collected within about 72 hours of delivery.",
    keywords: ["fresh", "freshness", "frozen", "processed"],
  },
  {
    question: "How do I contact a person?",
    answer:
      "Call the farm directly at (510) 535-1111, or see the Locations page for our address and hours.",
    keywords: ["contact", "phone", "call", "human", "person", "talk"],
  },
];

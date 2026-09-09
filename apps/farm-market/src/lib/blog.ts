export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  body: string[]; // paragraphs
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-we-sell-direct",
    title: "Why we sell direct instead of through a wholesaler",
    excerpt:
      "The math behind farm-direct pricing, and why cutting out the middleman means better prices for you and better margins for us.",
    date: "2026-08-15",
    body: [
      "Most meat sold in a grocery store has passed through at least three hands before it reaches you: the farm, a wholesale distributor, and the retailer — each one adding a markup to cover their own overhead.",
      "We sell direct instead. You're paying for the animal, the processing, and the delivery to your door — not a chain of distributors in between. That's the entire reason our prices can sit below typical retail while still paying fairly for pasture-raised animals.",
      "It also means we know exactly where every order comes from and where every animal was raised, because it's all us, start to finish.",
    ],
  },
  {
    slug: "how-we-price-against-market",
    title: "How we price against today's market — not a made-up number",
    excerpt:
      "Every price on this site is checked against current regional livestock and specialty-meat rates. Here's what that actually means.",
    date: "2026-08-22",
    body: [
      "Livestock and specialty meat prices move with the season, feed costs, and regional supply — they're not static. Rather than picking a number and leaving it, we check every price on this site against current regional rates for that animal and cut.",
      "You'll see this reflected on every product page under \"On pricing\" — a plain-language note on where that price sits relative to the broader market, whether that's below typical retail (most of our cuts) or in line with specialty pricing for less common items like duck or rabbit.",
      "We'd rather be transparent about how a price was set than just print a number and hope it looks reasonable.",
    ],
  },
  {
    slug: "whole-vs-butchered-which-to-choose",
    title: "Whole animal vs. butchered cuts: which should you order?",
    excerpt:
      "A quarter of lamb costs less per pound than a single rack — but it also means a freezer full of cuts you'll cook over months, not days.",
    date: "2026-09-01",
    body: [
      "For sheep, goat, and beef, you can order a quarter, half, or whole animal cut to order, or pick individual butchered cuts like chops, ground meat, or a roast.",
      "The whole-animal route is the better value per pound, and it means your freezer is stocked with a genuine variety of cuts — but it's a bigger upfront order and a real commitment of freezer space over the following months.",
      "Butchered cuts are the better fit if you know exactly what you're cooking this week, or you're trying a cut for the first time before committing to a larger order.",
      "Either way, it's the same pasture-raised animal — the only difference is how it's portioned.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

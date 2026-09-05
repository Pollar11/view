# Meadow & Market

A full-stack farm-to-door storefront for sheep, goat, chicken, duck, rabbit
and eggs — Tesla-style full-bleed hero + ChatGPT-desktop-style clean rounded
UI, dark/light mode, real inventory, real order/customer persistence, and an
opt-in SMS win-back campaign for repeat customers.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind. Persistence is a small
JSON-file-backed store (`data/store.json`, gitignored) — no external database
needed to run it. SMS goes through Twilio when configured, and safely no-ops
(logged, not sent) otherwise.

## Run it

```bash
cd apps/farm-market
npm install        # or run from the repo root: npm install
cp .env.example .env.local   # optional — every value has a safe default
npm run dev         # http://localhost:3100
```

## What's real vs. simulated

- **Real**: inventory/stock levels, order + customer persistence, coupon
  codes, delivery-distance estimate math, the "Farm Basket" multi-category
  discount, and free-delivery threshold — all computed from actual data, not
  hardcoded UI dressing.
- **Simulated**: payment. "Pay on delivery" is a real, common business model
  for local farm delivery; the "demo card" option validates like a real card
  (Luhn check) but never contacts a payment processor.
- **Optional, off by default**: SMS. Without `TWILIO_ACCOUNT_SID` /
  `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` set, every "send SMS" (order
  confirmation, win-back campaign) is recorded to the admin dashboard's SMS
  log as a mock send instead of hitting Twilio, so the whole flow works
  without a Twilio account.

## Pricing

| Product | Price | Basis |
| --- | --- | --- |
| Pasture-Raised Ewe | $4.99/lb | set by store owner |
| Hill-Raised Goat | $5.99/lb | set by store owner |
| Whole Farm Chicken | $13/chicken | set by store owner |
| Farm-Fresh Eggs (dozen) | $12/dozen | set by store owner |
| Whole Farm Duck | $7.99/lb | current specialty/farm-duck market rate |
| Whole Farm Rabbit | $8.99/lb | current specialty meat-rabbit market rate |

See each product page's "On pricing" note for the market comparison.

## Admin dashboard — `/admin`

Default demo password is `farm2026` (override with `ADMIN_PASSWORD`). From
there a store owner can see orders, stats, and the SMS-opted-in customer
list, and manually trigger a win-back text campaign (a real, unique discount
code per customer, sent only to customers who checked the SMS opt-in box —
never automatic, and never to anyone who didn't opt in).

## Photos

Product photos are hotlinked from Wikimedia Commons (free-to-use / openly
licensed), credited in the site footer under "Photo credits".

# View

A fast, ad-free video front-end you drop in front of your existing site or API.

- **No ads, ever.** No ad SDKs, no VAST/VMAP pre-roll, no trackers. A strict
  Content-Security-Policy plus HTML sanitization means upstream content *cannot*
  inject an ad even if it tries.
- **Live wall.** `/live` and a pinned block on the home page preview every live
  event *in place* — muted, lowest rendition, only the on-screen tiles stream
  (cap: `MAX_LIVE_PREVIEWS`). Pick one to open it full-screen, low-latency.
  Sports are grouped and ordered (`LIVE_SPORT_ORDER`, soccer first).
- **Findable.** Sticky jump-bar with scroll-spy, plus a ⌘K / `/` command
  palette to jump to any section, sport, or page.
- **More.** Score-only mode (`/scores`), Multiview 2×2 (`/multiview`),
  Watchlist (`/watchlist`, localStorage), unified live+VOD search, Cast /
  AirPlay + Picture-in-Picture + player keyboard shortcuts, hover/tap card
  previews with an inline details panel, a system/light/dark theme toggle,
  a subtle brand watermark (`--watermark-opacity`, default 9%), and an Admin
  panel (`/admin`) to reorder sports / hide sections / pin featured — no redeploy.

## Access

The whole app sits behind a login wall (`src/middleware.ts`). Set:

```
SITE_USER=admin26
SITE_PASSWORD=admin2026&
AUTH_SECRET=<long random string>
```

Sessions are stateless signed cookies (12 h). 3 failed logins → 2-minute
per-IP lockout. `/admin` has its own extra `ADMIN_TOKEN` gate (min 8 chars;
unset = admin disabled). Admin edits persist to memory in dev and to Vercel KV
when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set.
- **Low latency.** Streaming SSR, a request-deduped upstream Data Cache,
  edge-cacheable API routes (`s-maxage` + `stale-while-revalidate`), `hls.js` in
  low-latency mode, lazy media, ~108 kB first-load JS, no third-party scripts.
- **Tesla-style UI.** Minimal, high-contrast, generous whitespace, thin
  typography, full-bleed hero, uppercase tracked labels. Light/dark automatic.
- **Web + mobile.** Responsive and mobile-first; installable PWA. The same
  `/api/*` contract can back a native app later.

## Quick start

```bash
cd view
cp .env.example .env.local     # optional — runs on demo data with none set
npm install
npm run dev                     # http://localhost:3000
```

## Integrate your site

Set the provider in `.env.local`. Three adapters ship in `src/lib/content/`.

### 1. REST / JSON API (`CONTENT_PROVIDER=rest`)

```
SITE_API_URL=https://api.yoursite.com/v1
SITE_API_TOKEN=optional-bearer-token
```

View calls three endpoints:

| Method & path | Returns |
| --- | --- |
| `GET {SITE_API_URL}/sections` | `Section[]` or `{ items: Section[] }` |
| `GET {SITE_API_URL}/videos?section=&cursor=&limit=&q=` | `{ items: Video[], nextCursor?: string \| null }` |
| `GET {SITE_API_URL}/videos/{idOrSlug}` | `Video` |

**Video shape** (field aliases accepted — see `src/lib/normalize.ts`):

```jsonc
{
  "id": "abc123",
  "slug": "my-clip",
  "title": "My Clip",
  "description": "<p>HTML or text — sanitized on render.</p>",
  "thumbnail": "https://cdn.yoursite.com/abc123.jpg",
  "sources": [
    { "url": "https://cdn.yoursite.com/abc123/master.m3u8", "type": "application/x-mpegURL", "label": "Auto" },
    { "url": "https://cdn.yoursite.com/abc123/720.mp4", "type": "video/mp4", "label": "720p" }
  ],
  "durationSeconds": 596,
  "publishedAt": "2025-01-10T00:00:00.000Z",
  "views": 12345,
  "sections": ["featured", "films"],
  "tags": ["animation"],
  "canonicalUrl": "https://yoursite.com/watch/abc123"
}
```

**Section shape:**

```jsonc
{ "slug": "films", "title": "Short Films", "order": 1, "layout": "rail" }
```

#### Live events (optional)

If you set `CONTENT_PROVIDER=rest`, View also calls:

| Method & path | Returns |
| --- | --- |
| `GET {SITE_API_URL}/live?sport=&status=` | `LiveEvent[]` or `{ items: LiveEvent[] }` |
| `GET {SITE_API_URL}/live/{idOrSlug}` | `LiveEvent` |

```jsonc
{
  "id": "ev-123",
  "slug": "arsenal-vs-chelsea",
  "title": "Arsenal vs Chelsea",
  "sport": "soccer",                 // slug — drives grouping/ordering
  "sportLabel": "Soccer",
  "competition": "Premier League",
  "status": "live",                  // "live" | "upcoming" | "ended"
  "startsAt": "2025-01-01T15:00:00Z",
  "thumbnail": "https://cdn.you/ev-123.jpg",
  "home": "Arsenal", "away": "Chelsea",
  "score": { "home": 1, "away": 1 },
  "viewers": 84210,
  "sources":       [{ "url": "https://cdn.you/ev-123/ll.m3u8", "type": "application/x-mpegURL" }],
  "previewSource": { "url": "https://cdn.you/ev-123/240p.m3u8", "type": "application/x-mpegURL" }
}
```

Return an empty list when nothing is live. Endpoints are polled every
`LIVE_REVALIDATE_SECONDS` (default 15). Sport order is `LIVE_SPORT_ORDER`
(soccer first by default).

### 2. RSS / Media RSS (`CONTENT_PROVIDER=rss`)

```
RSS_FEEDS=https://yoursite.com/feed/films.xml,https://yoursite.com/feed/news.xml
```

Each feed becomes a section. `<media:content>` / `<media:thumbnail>` /
`<enclosure>` are used for the video URL and poster.

### 3. Custom

Implement the `ContentProvider` interface (`src/lib/types.ts`) and register it
in `src/lib/content/index.ts`.

## Ad-blocking: how it works

| Layer | File | What it does |
| --- | --- | --- |
| No ad code | — | Zero ad/analytics dependencies in `package.json`. |
| CSP | `next.config.mjs` | `script-src 'self'`, `frame-src` limited to known video hosts, `object-src 'none'`, ad-auction Permissions-Policy denied. |
| HTML sanitization | `src/lib/sanitize.ts` | Strips `<script>`/`<style>`/handlers; drops iframes/images/links pointing at ~25 ad & tracker host patterns; iframe allow-list for Vimeo/YouTube-nocookie/Cloudflare/Bunny. |
| Source filtering | `src/lib/normalize.ts` | Playback sources and thumbnails on blocked hosts are discarded during ingest. |
| Player | `src/components/Player.tsx` | Native `<video>` + `hls.js`. No third-party player embed, so no ad macro can run. |

## API surface (for a native client)

- `GET /api/sections`
- `GET /api/videos?section=&cursor=&limit=&q=`
- `GET /api/videos/{idOrSlug}`
- `GET /api/health` — provider + latency probe

All are cache-friendly and CORS-safe for same-origin. Add your origins to
`next.config.mjs` `headers()` if a separate mobile app needs cross-origin access.

## Embedding into an existing page

`/watch/{id}` is safe to load in an `<iframe>` on your own domain
(`frame-ancestors 'self'` — widen it in `next.config.mjs` for other domains).

## Rendering & caching

Pages (`/`, `/s/*`, `/watch/*`) and the `/api/*` routes are **rendered per
request** (`dynamic = "force-dynamic"`) so nothing depends on what data existed
at build time and the catalog is never stale. Speed comes from two caches you
control with `CONTENT_REVALIDATE_SECONDS` (default 60):

- **Data Cache** — the upstream call in `RestProvider`/`RssProvider` is cached
  and deduped for that many seconds, and served stale if your API briefly fails.
- **CDN Cache** — every `/api/*` response carries
  `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`, so Vercel /
  Cloudflare / any CDN serves most hits from the edge.

Local warm responses measured 3–25 ms. If your API goes down, cached routes keep
serving and uncached ones return a clean `502 { error }` — the site stays up.

## Deploy

Any Node host or Vercel/Netlify. Set the same env vars, then
`npm run build && npm start`. Because rendering is per-request you do **not**
need your API reachable at build time.

## Testing

```bash
npm run build
bash test/run-all.sh        # boots a mock backend, runs 33–38 assertions
                            # against a prod build under all 3 providers
```

- `test/mock-api.mjs` — a reference implementation of the exact API contract
  (also serves `/feed.xml` for the RSS adapter). Diff your real backend against
  it. It intentionally serves hostile data (ad `<script>`, DoubleClick iframe,
  a source on an ad host) so the run proves View strips all of it.
- `test/validate.mjs` — `BASE=https://your-deployment node test/validate.mjs`
  runs the same checks against any live instance, including yours.

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` / `npm start` | Production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

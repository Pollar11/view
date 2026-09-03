# View API

NestJS + Prisma. Aggregates three content sources into a sanitised metadata
catalogue and serves it over an authenticated REST API.

## Run

```bash
cp .env.example .env
node -e "console.log('JWT_ACCESS_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
node -e "console.log('JWT_REFRESH_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
npx prisma migrate dev
npm run seed          # optional demo data
npm run start:dev     # http://localhost:4000/api
```

Production: `npm run build && npm start` (runs `prisma generate` + `tsc`).

### PostgreSQL

Set `DATABASE_URL` to a Postgres URL and change `provider = "postgresql"` in
[`prisma/schema.prisma`](prisma/schema.prisma), then `npx prisma migrate deploy`.
The schema uses no arrays / native enums, so it is portable as‑is.

## Sources

All source config is environment‑only (`SOURCE_1_URL` … `SOURCE_3_URL`). See the
heavily‑commented [`.env.example`](.env.example). Exactly one source is expected
to have an official JSON API (`SOURCE_1_KIND=api`); the other two are scraped
(`SOURCE_n_KIND=scrape`).

- **API source** — `src/sources/adapters/api-source.adapter.ts`. Calls
  `{SOURCE_1_URL}{SOURCE_1_API_PATH}?category=&page=&limit=`, accepts an array or
  `{items|data|results:[…]}`, matches fields loosely.
- **Scrape sources** — `src/sources/adapters/scrape-source.adapter.ts`. Crawls
  the configured listing paths, follows same‑origin links matching
  `SOURCE_n_ITEM_PATTERN`, then reads JSON‑LD (`Movie` / `SportsEvent` / …),
  Open Graph, then `<title>`/`<meta>` — in that order. `robots.txt` and
  `Crawl-delay` are honoured; one request per host at a time.

Ingest runs on a cron (`INGEST_CRON`, default every 30 min) and once on boot if
the catalogue is empty. Trigger manually:

```bash
npm run ingest                                   # CLI, no server
curl -XPOST localhost:4000/api/admin/ingest -H "x-admin-token: $ADMIN_TOKEN"
```

## Endpoints

| Method | Path | Auth | |
| --- | --- | :---: | --- |
| POST | `/api/auth/register` | — | `{ email, password, displayName }` → `{ user, tokens }` |
| POST | `/api/auth/login` | — | → `{ user, tokens }` |
| POST | `/api/auth/refresh` | — | `{ refreshToken }` → new `{ user, tokens }` (rotates; reuse revokes family) |
| POST | `/api/auth/logout` | ✔ | revokes the presented (or all) refresh tokens |
| GET | `/api/auth/me` | ✔ | current user + preferences |
| PATCH | `/api/users/me` | ✔ | `{ displayName }` |
| PATCH | `/api/users/me/preferences` | ✔ | `{ favoriteCategories?, favoriteGenres?, matchNotifications? }` |
| GET | `/api/home` | optional | hero + rails (adds "You Might Like" when authed) |
| GET | `/api/items?category=&genre=&year=&q=&sort=&page=&limit=` | optional | paginated |
| GET | `/api/items/:idOrSlug` | optional | one item (logs a view when authed) |
| GET | `/api/items/:idOrSlug/source` | ✔ | `{ url }` — the upstream page, returned only here |
| GET | `/api/items/upcoming` | — | sports starting soon |
| GET | `/api/search?q=&page=` | — | search (min 2 chars) |
| POST | `/api/interactions` | ✔ | `{ itemId, type: view\|favorite\|unfavorite\|rating, value? }` |
| GET | `/api/interactions/favorites` | ✔ | |
| GET | `/api/interactions/history?type=` | ✔ | |
| GET | `/api/recommendations?limit=` | ✔ | `[{ item, score, reason }]` |
| POST | `/api/admin/ingest` | admin token | force a refresh |
| GET | `/api/health` | — | catalogue counts + per‑source last‑run status |
| GET | `/api/media/:ref` | — | signed image proxy |

## Recommender

`src/recommendations/recommendations.service.ts`. Builds a sparse preference
vector from interactions (favorite +3, rating `(v−3)·1.2`, view +0.4) over
`{category, genre, tag, decade}` features, scores unseen candidates by cosine
similarity, blends `0.8·content + 0.2·popularity`. Cold start → popular titles in
the user's preferred categories. Results cached 2 min, busted on any interaction.

## Tests

```bash
npm run test:e2e     # builds, boots mock sources + API, 41 assertions
npm run typecheck
```

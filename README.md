<div align="center">

# View

**A fast, ad‑free content aggregator — one client for desktop, Android and iOS.**

Movies · Live sport · Documentaries — pulled from three sources, reduced to
clean metadata, and served through a single low‑latency API.

</div>

---

## What's in the box

| Package | Stack | Runs on |
| --- | --- | --- |
| [`apps/api`](apps/api) | **NestJS** · Prisma · SQLite/Postgres · JWT · Cheerio | Node 18+ |
| [`apps/app`](apps/app) | **Expo** (React Native) · Expo Router · Redux Toolkit + RTK Query | iOS · Android · Web |
| [`apps/desktop`](apps/desktop) | **Tauri 2** shell around the web build | macOS · Windows · Linux |
| [`packages/shared`](packages/shared) | TypeScript contract types shared by API + app | — |
| [`apps/web`](apps/web) | *(legacy)* the original standalone Next.js front‑end, kept for reference | — |

The API, the Expo app and the Tauri shell are the deliverable. `apps/web` is an
earlier take and is **not** part of the workspace build.

---

## Architecture

```
 ┌────────────┐   scrape/API    ┌───────────────────────────────┐
 │  Source 1  │ ───(official)──▶ │            View API           │
 │  Source 2  │ ───(scrape)────▶ │  NestJS                       │
 │  Source 3  │ ───(scrape)────▶ │   • ingest + sanitize (cron)  │
 └────────────┘                  │   • auth  (bcrypt + JWT)      │
   URLs live ONLY in the API's   │   • items / search / reco    │
   environment. Never sent to    │   • in‑memory cache          │
   the client, logs, or an AI.   │   • SQLite / PostgreSQL       │
                                 └──────────────┬────────────────┘
                                                │  REST (bearer token)
                        ┌───────────────────────┼────────────────────────┐
                        ▼                       ▼                        ▼
                 ┌────────────┐          ┌────────────┐           ┌────────────┐
                 │  iOS app   │          │ Android app│           │  Web build │
                 │  (Expo)    │          │  (Expo)    │           │  (Expo)    │
                 └────────────┘          └────────────┘           └─────┬──────┘
                                                                       ▼
                                                                ┌────────────┐
                                                                │  Tauri     │
                                                                │  desktop   │
                                                                └────────────┘
```

### How source privacy is enforced

- Source base URLs / API keys are read **only** from `apps/api/.env`
  (`SOURCE_1_URL` … `SOURCE_3_URL`). Nothing else in the repo references them.
- Every ingested text field passes through `TextSanitizer`
  ([`apps/api/src/common/text/sanitize.ts`](apps/api/src/common/text/sanitize.ts)):
  HTML stripped, URLs / emails / @handles removed, source brand names + hostnames
  scrubbed, tracker boilerplate removed.
- `toItemDto` ([`apps/api/src/items/item.mapper.ts`](apps/api/src/items/item.mapper.ts))
  is the single place a DB row becomes an API response — `sourceId`,
  `externalId` and `sourcePageUrl` are structurally dropped.
- Poster images are rewritten to opaque, HMAC‑signed `/media/…` paths and proxied
  through the API, so the upstream image host never reaches the client.
- The "Watch" link is stored server‑side and returned **only** by
  `GET /items/:id/source`, which requires a valid access token.
- Only metadata is stored. No stream URLs, no download links, no media files.
- Scraping honours `robots.txt` and the site's `Crawl-delay`, one request per
  host at a time.

---

## Quick start (all three, locally)

Prereqs: **Node ≥ 18.18**, npm ≥ 9. (Desktop build also needs **Rust**; iOS/Android
builds need Xcode / Android Studio.)

```bash
git clone <this repo> view && cd view
npm install
```

### 1 · Backend

```bash
cd apps/api
cp .env.example .env
# generate two secrets:
node -e "console.log('JWT_ACCESS_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
node -e "console.log('JWT_REFRESH_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
npx prisma migrate dev          # creates SQLite db + schema
npm run seed                    # demo catalogue + demo@view.app / DemoPass123
npm run start:dev               # http://localhost:4000/api
```

Add your real sources to `apps/api/.env` (`SOURCE_1_URL` …) and either wait for
the 30‑minute cron or run `npm run ingest` once.

### 2 · App (web / iOS / Android)

```bash
cd apps/app
cp .env.example .env             # EXPO_PUBLIC_API_URL=http://localhost:4000/api
npm run start                    # press w / i / a  for web / iOS / Android
```

Log in with `demo@view.app` / `DemoPass123`, or register a new account.

### 3 · Desktop

```bash
cd apps/desktop
npm run dev                      # builds the web export, opens the Tauri window
```

---

## Build for release

| Target | Command | Output |
| --- | --- | --- |
| API | `npm --workspace @view/api run build && npm --workspace @view/api start` | `apps/api/dist` |
| **Web** | `npm --workspace @view/app run export:web` | `apps/app/dist/` (static, serve behind an SPA fallback) |
| **Android APK/AAB** | see [`apps/app/README.md`](apps/app/README.md#android) | `.apk` / `.aab` via EAS or local Gradle |
| **iOS IPA** | see [`apps/app/README.md`](apps/app/README.md#ios) | `.ipa` via EAS or Xcode |
| **Desktop** | `npm --workspace @view/desktop run build` | `.dmg` / `.msi` / `.AppImage` in `apps/desktop/src-tauri/target/release/bundle/` |

---

## Testing

```bash
# backend: boots mock sources + a real API, ingests, asserts nothing leaks
npm --workspace @view/api run test:e2e        # 41 assertions

# typecheck everything
npm run typecheck
```

The e2e suite ([`apps/api/test/`](apps/api/test)) stands up reference
implementations of all three source shapes — one JSON API, two hostile HTML
sites embedding brand names, tracking scripts and absolute URLs — and proves the
API strips every trace of them.

---

## Features

**Catalogue** · hero carousel · per‑category rails · trending · infinite‑scroll
browse with sort + genre filters · unified search · related titles.

**Personalization** · view / favorite / rating tracking · a hybrid
content‑based + popularity recommender (`GET /recommendations`) · a derived
genre profile shown on the Profile screen · a personalised "You Might Like" rail.

**Live sport** · kickoff countdowns · an "Upcoming Matches" rail · opt‑in local
notifications 15 minutes before a match starts.

**UX** · Tesla‑adjacent dark system — near‑black grounds, hairline borders,
thin type, uppercase tracked labels · hover / long‑press card previews showing
the synopsis · spring micro‑interactions · responsive 2→5 column grids · works
offline‑ish via RTK Query cache.

**Security** · bcrypt (cost 12) · short‑lived JWT access tokens + rotating
refresh tokens (reuse detection revokes the family) · every endpoint except
`register` / `login` / `refresh` / `health` is auth‑guarded · rate limiting ·
Helmet · strict input validation · generic error bodies (no stack traces).

**Performance** · in‑memory response cache with targeted invalidation · a
scheduled ingest so requests never hit a source site · request‑time pagination ·
~2 MB web bundle · single round‑trip token refresh.

---

## Repo layout

```
view/
├── apps/
│   ├── api/         NestJS backend  ─ start here
│   ├── app/         Expo client (iOS / Android / Web)
│   ├── desktop/     Tauri 2 shell
│   └── web/         legacy Next.js front-end (not in the workspace build)
├── packages/
│   └── shared/      shared TypeScript types / API contract
└── package.json     npm workspaces root
```

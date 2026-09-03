# Replacing the content sources — step by step

View pulls its catalogue from **three sources** you configure in
`apps/api/.env`. Nothing about them is hardcoded and nothing about them is ever
sent to the app. This guide takes you from "I have three websites" to "the app
shows their content", with nothing skipped.

The three sources currently wired up are real, free and keyless, so you can
verify the whole pipeline before touching anything:

| Slot | Source | Kind | Feeds |
| --- | --- | --- | --- |
| `SOURCE_1` | TVmaze (`api.tvmaze.com`) | api | movies |
| `SOURCE_2` | OpenLigaDB (`api.openligadb.de`) | api | sports |
| `SOURCE_3` | Internet Archive (`archive.org`) | api | documentaries |

---

## Step 0 — Prerequisites (once)

```bash
cd /Users/ezi/Projects/view
npm install
cd apps/api
cp .env.example .env          # if you don't already have apps/api/.env
```

Add JWT secrets to `apps/api/.env` if they aren't there yet:

```bash
node -e "console.log('JWT_ACCESS_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
node -e "console.log('JWT_REFRESH_SECRET='+require('crypto').randomBytes(48).toString('base64url'))" >> .env
```

Create the database and a demo login:

```bash
npx prisma migrate deploy
npm run seed                  # demo user demo@view.app / DemoPass123 (+ a little demo data)
```

---

## Step 1 — Open the env file

`apps/api/.env` is a dotfile, so Finder hides it. Use one of:

```bash
open -e /Users/ezi/Projects/view/apps/api/.env      # TextEdit
code   /Users/ezi/Projects/view/apps/api/.env       # VS Code
```

or press **⌘ + Shift + .** in a Finder window to reveal hidden files.

**Never edit `.env.example`** — that is only the template. `.env` is the file the
API reads, and it is git-ignored so it never gets pushed.

---

## Step 2 — Decide, per site: API or scrape?

For each of your three sites, open it and check for a public data feed:

- Look for a documented API, an `/api/...` path, a `.json` endpoint, or an RSS
  feed. Browser devtools → Network tab → reload → filter to `Fetch/XHR` and see
  if the page loads its content from a JSON endpoint you can hit directly.
- **Has one → `kind=api`** (reliable, fast, preferred).
- **No feed, just HTML pages → `kind=scrape`** (works, but fragile; many big
  sites block bots — if you get `403`s, that site can't be scraped).

Exactly one of your three is expected to have an official API; the other two are
scraped. That split is a convention, not a hard rule — you can set all three to
`api` or all three to `scrape`.

---

## Step 3a — Configure an `api` source

Minimum:

```ini
SOURCE_1_URL=https://api.example.com      # base URL, no trailing slash
SOURCE_1_KIND=api
SOURCE_1_CATEGORIES=movies                # movies | sports | documentaries (comma-sep for several)
SOURCE_1_NAME=Example                      # the site's brand — scrubbed from all text
SOURCE_1_API_PATH=/titles                  # the collection endpoint
```

The adapter calls `GET {URL}{API_PATH}?category=&page=&limit=` and accepts an
array, or `{items|data|results|records|content|events|docs: [...]}`, or one level
of nesting (`{response:{docs:[...]}}`). Row fields are matched loosely
(`id`/`identifier`/…, `title`/`name`/…, `overview`/`summary`/…, `poster`/`image`/…,
`genres`/`genre`/`subject`, `year`/`releaseDate`, `startsAt`/`date`/`dateEvent`).
For fixtures with no title field it builds `"Home vs Away"` from
`home`/`away`/`team1`/`team2`.

Optional knobs when the API is picky (all are `SOURCE_n_...`):

| Var | Use |
| --- | --- |
| `API_KEY` | sent as `Authorization: Bearer` and `X-API-Key` |
| `API_QUERY` | extra raw query string, e.g. `q=collection:foo&output=json` |
| `API_PAGE_PARAM` | page param name (default `page`; **set empty** if the API returns everything at once) |
| `API_START_PAGE` | first page number (default `1`; some APIs are 0-indexed) |
| `API_CATEGORY_PARAM` | **set empty** if the API rejects an unknown `category` param |
| `API_LIMIT_PARAM` | **set empty** if the API rejects an unknown `limit` param |
| `PAGE_URL_TEMPLATE` | the "Watch" link, with `{id}` — e.g. `https://example.com/watch/{id}` |
| `USER_AGENT` | override the outbound User-Agent for this source |

### Worked example — the Internet Archive source (`SOURCE_3`)

```ini
SOURCE_3_URL=https://archive.org
SOURCE_3_KIND=api
SOURCE_3_CATEGORIES=documentaries
SOURCE_3_NAME=Internet Archive
SOURCE_3_API_PATH=/advancedsearch.php
SOURCE_3_API_QUERY=q=collection:(prelinger) AND mediatype:(movies)&fl[]=identifier&fl[]=title&fl[]=description&fl[]=year&fl[]=subject&sort[]=downloads desc&output=json&rows=50
SOURCE_3_API_CATEGORY_PARAM=
SOURCE_3_API_LIMIT_PARAM=
SOURCE_3_API_PAGE_PARAM=page
SOURCE_3_PAGE_URL_TEMPLATE=https://archive.org/details/{id}
```

---

## Step 3b — Configure a `scrape` source

```ini
SOURCE_2_URL=https://example.com
SOURCE_2_KIND=scrape
SOURCE_2_CATEGORIES=sports
SOURCE_2_NAME=Example
SOURCE_2_LIST_PATHS=/browse,/browse/popular   # listing pages to crawl (comma-sep)
SOURCE_2_ITEM_PATTERN=/watch/[^/]+$           # regex a link path must match to be an item page
SOURCE_2_MAX_LIST_PAGES=4                       # how many ?page=N of each listing to walk
SOURCE_2_CRAWL_DELAY_MS=1500                    # politeness delay between requests
```

The scraper crawls the listing pages, follows same-origin links whose path
matches `ITEM_PATTERN`, then on each detail page reads metadata in this order:
**JSON-LD** (`Movie` / `SportsEvent` / `Documentary` / …) → **Open Graph** /
Twitter card → `<title>` + `<meta name="description">`. It reads only metadata —
no `<video>` / `<source>` / `<iframe>` URL is ever touched. `robots.txt` and any
declared `Crawl-delay` are honoured; leave `INGEST_RESPECT_ROBOTS=true`.

Leave `ITEM_PATTERN` blank to let it guess (any path with ≥ 2 segments).

---

## Step 4 — Pull the content

Stop the API if it's running (`Ctrl+C`), then from `apps/api`:

```bash
npm run ingest
```

This reads `.env`, fetches + sanitises metadata, writes it to the database, and
prints a summary **with no URLs in it**, e.g.:

```
Ingest done: 358 item(s) upserted across 3 source(s).
  s1 api    ok=true  items=120
  s2 api    ok=true  items=118
  s3 api    ok=true  items=120
```

(Once the API server is running, it also re-ingests automatically every 30 min,
and you can trigger it without the CLI:
`curl -XPOST localhost:4000/api/admin/ingest -H "x-admin-token: $ADMIN_TOKEN"`.)

---

## Step 5 — Start everything and verify

**Terminal 1 — API**

```bash
cd /Users/ezi/Projects/view/apps/api
npm run start:dev
```

**Terminal 2 — check the catalogue** (no app needed):

```bash
curl -s localhost:4000/api/health | python3 -m json.tool
```

You want `catalogue.byCategory` to show non-zero counts and every entry in
`sources` to be `"ok": true`.

Spot-check that nothing leaked:

```bash
curl -s "localhost:4000/api/items?limit=50" | grep -c "http"      # want 0
curl -s "localhost:4000/api/items?limit=50" | grep -ci "yoursitename"  # want 0
```

**Terminal 3 — the app**

```bash
cd /Users/ezi/Projects/view/apps/app
npm run start        # press w for web
```

Sign in with `demo@view.app` / `DemoPass123`. The home hero, the Movies / Sports
/ Documentaries sections and search should now show your sources' content.

---

## Step 6 — If a source returns `items=0`

| Symptom | Fix |
| --- | --- |
| `ok=true, items=0` on an **api** source | wrong `API_PATH`, or the response wraps rows in an unusual key, or the API `400`s on the `category`/`limit`/`page` params → set `SOURCE_n_API_CATEGORY_PARAM=` / `_LIMIT_PARAM=` / `_PAGE_PARAM=`. Test the exact URL by hand: `curl "https://api.example.com/titles?category=movies&page=1&limit=50"` and look at the JSON shape. |
| `ok=false` with a message about `403` / `429` | the host is blocking automated requests. Try `SOURCE_n_USER_AGENT=Mozilla/5.0 ...`; if it still blocks, that source can't be used. |
| **scrape** source, `items=0` | `ITEM_PATTERN` doesn't match the site's detail-page URLs (open one and check its path), or `LIST_PATHS` is wrong, or the pages are rendered client-side in JS (a server scraper sees an empty shell — that site needs an API instead). |
| items appear but titles/years are junk | the source's field names are unusual; tell me the site and I'll add the mapping. |

After any change: re-run `npm run ingest`, then restart the API (or wait ~60s for
its response cache to expire) and refresh the app.

---

## Reminder — what is and isn't allowed

Only aggregate sources you have the right to use: your own catalogue, a partner's
API, a public-domain archive, a licensed feed. View stores **metadata only** and
the "Watch" button opens the source's own page in the browser — it never streams
or rehosts anything. Pointing it at sites dedicated to unlicensed streaming is
not something this project will help you set up.

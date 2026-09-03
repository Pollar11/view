/**
 * End-to-end: boots the mock source server + a real API process wired to it,
 * runs an ingest, and asserts the full contract — including that NO source
 * URL, hostname, brand name, email or tracker string survives into the API.
 *
 *   node test/e2e.mjs            (from apps/api, after `npm run build`)
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { startMockSources } from './mock-sources.mjs';

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`); }
};

const API_PORT = 4599;
const BASE = `http://127.0.0.1:${API_PORT}/api`;
const j = (r) => r.json();

const mock = await startMockSources();
console.log(`Mock sources at ${mock.origin}`);

const env = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: String(API_PORT),
  DATABASE_URL: 'file:./e2e.db',
  JWT_ACCESS_SECRET: 'e2e-access-secret-0123456789abcdef',
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-0123456789abcdef',
  ADMIN_TOKEN: 'e2e-admin-token',
  INGEST_ENABLED: 'false',
  CACHE_TTL_SECONDS: '1',
  SOURCE_1_URL: `${mock.origin}`,
  SOURCE_1_KIND: 'api',
  SOURCE_1_CATEGORIES: 'movies',
  SOURCE_1_API_PATH: '/api/items',
  SOURCE_1_NAME: 'Example Movies API',
  SOURCE_2_URL: `${mock.origin}`,
  SOURCE_2_KIND: 'scrape',
  SOURCE_2_CATEGORIES: 'movies',
  SOURCE_2_NAME: 'FlickHaven',
  SOURCE_2_LIST_PATHS: '/flicks',
  SOURCE_2_ITEM_PATTERN: '/flicks/[\\w-]+$',
  SOURCE_3_URL: `${mock.origin}`,
  SOURCE_3_KIND: 'scrape',
  SOURCE_3_CATEGORIES: 'sports',
  SOURCE_3_NAME: 'MatchStream Pro',
  SOURCE_3_LIST_PATHS: '/fixtures',
  SOURCE_3_ITEM_PATTERN: '/fixtures/[\\w-]+$',
  SCRUB_TERMS: 'flickhaven,matchstream',
};

// fresh db
import { rmSync } from 'node:fs';
for (const f of ['prisma/e2e.db', 'prisma/e2e.db-journal']) { try { rmSync(f); } catch {} }
await run('npx', ['prisma', 'migrate', 'deploy'], env);

const api = spawn('node', ['dist/apps/api/src/main.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
api.stdout.on('data', () => {});
api.stderr.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(d));

try {
  await waitFor(`${BASE}/health`, 20000);

  // ---- ingest ----
  const ingRes = await fetch(`${BASE}/admin/ingest`, {
    method: 'POST',
    headers: { 'x-admin-token': 'e2e-admin-token' },
  });
  const ing = await j(ingRes);
  ok('admin ingest requires token', (await fetch(`${BASE}/admin/ingest`, { method: 'POST' })).status === 403);
  ok('ingest ran for 3 sources', ing.summary.sources.length === 3, JSON.stringify(ing.summary.sources));
  ok('every source ok', ing.summary.sources.every((s) => s.ok));
  ok('ingest upserted items', ing.summary.upserted >= 5, `${ing.summary.upserted}`);

  // ---- catalogue ----
  const health = await j(await fetch(`${BASE}/health`));
  ok('movies present', health.catalogue.byCategory.movies >= 3);
  ok('sports present', health.catalogue.byCategory.sports >= 2);

  const moviesPage = await j(await fetch(`${BASE}/items?category=movies&limit=50`));
  ok('movies list paginated shape', Array.isArray(moviesPage.items) && typeof moviesPage.total === 'number');
  ok('all returned items are movies', moviesPage.items.every((i) => i.category === 'movies'));

  const allItems = await j(await fetch(`${BASE}/items?limit=50`));
  const blob = JSON.stringify(allItems);

  // ---- the important one: nothing identifying leaked ----
  ok('no source hostname leaked', !/\.test\b/.test(blob) && !new RegExp(mock.origin).test(blob));
  ok('no http(s) URL in any item', !/https?:\/\//.test(blob));
  ok('no brand name "FlickHaven"', !/flickhaven/i.test(blob));
  ok('no brand name "MatchStream"', !/matchstream/i.test(blob));
  ok('no email address', !/@[a-z0-9.-]+\.[a-z]{2,}/i.test(blob));
  ok('no tracker string', !/tracking pixel|analytics/i.test(blob));
  ok('no stream/m3u8 url', !/m3u8|\/embed\/|master\./i.test(blob));
  ok('poster URLs are opaque /media paths', allItems.items.every((i) => i.posterUrl === null || i.posterUrl.startsWith('/api/media/')));

  // scraped content still yielded real metadata
  const withGenre = allItems.items.filter((i) => i.genres.length > 0);
  ok('scraped items kept genres', withGenre.length >= 3);
  const sport = allItems.items.find((i) => i.category === 'sports');
  ok('scraped sports item has startsAt', sport && sport.startsAt, JSON.stringify(sport));
  ok('scraped movie has description text', allItems.items.some((i) => i.category === 'movies' && i.description.length > 20));

  // ---- auth ----
  const reg = await j(await fetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'e2e@view.app', password: 'Str0ngPass', displayName: 'E2E' }),
  }));
  ok('register returns tokens', reg.tokens?.accessToken && reg.tokens?.refreshToken);
  const access = reg.tokens.accessToken;
  const auth = { authorization: `Bearer ${access}` };

  ok('protected route rejects anon', (await fetch(`${BASE}/recommendations`)).status === 401);
  ok('protected route accepts token', (await fetch(`${BASE}/recommendations`, { headers: auth })).status === 200);

  const dupe = await fetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'e2e@view.app', password: 'Str0ngPass', displayName: 'E2E' }),
  });
  ok('duplicate email rejected (409)', dupe.status === 409);
  ok('weak password rejected (400)', (await fetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'x@y.com', password: 'short', displayName: 'X' }),
  })).status === 400);

  const bad = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'e2e@view.app', password: 'wrong' }),
  });
  ok('bad login rejected (401)', bad.status === 401);

  const refreshed = await j(await fetch(`${BASE}/auth/refresh`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: reg.tokens.refreshToken }),
  }));
  ok('refresh issues new access token', refreshed.tokens?.accessToken && refreshed.tokens.accessToken !== access);
  ok('old refresh token now invalid', (await fetch(`${BASE}/auth/refresh`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: reg.tokens.refreshToken }),
  })).status === 401);

  // ---- interactions + recommendations ----
  const target = allItems.items.find((i) => i.category === 'movies');
  const fav = await fetch(`${BASE}/interactions`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ itemId: target.id, type: 'favorite' }),
  });
  ok('favorite recorded (201)', fav.status === 201);
  await fetch(`${BASE}/interactions`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ itemId: target.id, type: 'rating', value: 5 }),
  });
  ok('rating without value rejected (400)', (await fetch(`${BASE}/interactions`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ itemId: target.id, type: 'rating' }),
  })).status === 400);

  const favs = await j(await fetch(`${BASE}/interactions/favorites`, { headers: auth }));
  ok('favorites list includes item', favs.some((i) => i.id === target.id));

  const recos = await j(await fetch(`${BASE}/recommendations`, { headers: auth }));
  ok('recommendations returned', Array.isArray(recos) && recos.length > 0);
  ok('recommendations exclude already-favorited', !recos.some((r) => r.item.id === target.id));
  ok('recommendations carry a reason', recos.every((r) => typeof r.reason === 'string' && r.reason.length > 0));
  ok('recommendation payload has no URL', !/https?:\/\//.test(JSON.stringify(recos)));

  // ---- source link ----
  const src = await fetch(`${BASE}/items/${target.id}/source`, { headers: auth });
  ok('source link needs auth', (await fetch(`${BASE}/items/${target.id}/source`)).status === 401);
  const srcBody = await j(src);
  ok('source link resolves to a real upstream URL', typeof srcBody.url === 'string' && srcBody.url.startsWith('http'));
  ok('source link is NOT in the item detail payload', !('sourcePageUrl' in (await j(await fetch(`${BASE}/items/${target.id}`)))));

  // ---- search ----
  const s = await j(await fetch(`${BASE}/search?q=${encodeURIComponent(target.title.split(' ')[0])}`));
  ok('search finds the item', s.items.some((i) => i.id === target.id));
  ok('short query returns empty', (await j(await fetch(`${BASE}/search?q=a`))).items.length === 0);

  // ---- security headers ----
  const h = await fetch(`${BASE}/health`);
  ok('helmet: x-content-type-options', h.headers.get('x-content-type-options') === 'nosniff');
  ok('no x-powered-by', !h.headers.get('x-powered-by'));
} finally {
  api.kill('SIGKILL');
  await mock.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

/* helpers */
async function waitFor(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await sleep(300);
  }
  throw new Error(`timed out waiting for ${url}`);
}
function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { env, stdio: 'inherit' });
    p.on('exit', (c) => (c === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${c}`))));
  });
}

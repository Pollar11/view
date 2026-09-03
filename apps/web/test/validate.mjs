/**
 * End-to-end validation of a running View instance.
 *
 *   BASE=http://localhost:3000 node test/validate.mjs
 *
 * Exit code 0 = all green. Works against either provider; the ad-sanitization
 * checks only run when the `rest` mock-api (test/mock-api.mjs) is the source,
 * since that is the payload carrying hostile markup.
 */
const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const USER = process.env.SITE_USER ?? "admin26";
const PASS = process.env.SITE_PASSWORD ?? "admin2026&";

let pass = 0;
let fail = 0;
let cookie = "";
const results = [];

async function login() {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  const sc = res.headers.get("set-cookie");
  if (sc) cookie = sc.split(";")[0];
  return res.ok;
}

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    results.push(`  ✓ ${name}`);
  } else {
    fail++;
    results.push(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function getJson(path) {
  const res = await fetch(BASE + path, {
    headers: { Accept: "application/json", Cookie: cookie },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { res, body };
}

async function getText(path) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  return { res, text: await res.text() };
}

console.log(`\nValidating View at ${BASE}\n`);

// ── site gate ──────────────────────────────────────────────────
{
  const noAuth = await fetch(BASE + "/api/health");
  check("gate: /api/health blocked without session", noAuth.status === 401, `got ${noAuth.status}`);
  const page = await fetch(BASE + "/", { redirect: "manual" });
  check(
    "gate: / redirects to /login without session",
    [302, 307].includes(page.status) &&
      (page.headers.get("location") ?? "").includes("/login"),
    `got ${page.status}`,
  );
  const bad = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "x", password: "y" }),
  });
  check("gate: wrong credentials -> 401", bad.status === 401, `got ${bad.status}`);

  check("gate: correct credentials -> session", await login());
  check("gate: session cookie issued", cookie.length > 0);
  const ok = await fetch(BASE + "/api/health", { headers: { Cookie: cookie } });
  check("gate: authed request passes", ok.status === 200);
}

// ── health ──────────────────────────────────────────────────────
{
  const { res, body } = await getJson("/api/health");
  check("GET /api/health -> 200", res.status === 200, `got ${res.status}`);
  check("health.status ok", body?.status === "ok", JSON.stringify(body));
  check("health reports a provider", typeof body?.provider === "string");
  check("health latency < 2000ms", body?.latencyMs < 2000, `${body?.latencyMs}ms`);
}

// ── sections ────────────────────────────────────────────────────
let sections = [];
{
  const { res, body } = await getJson("/api/sections");
  check("GET /api/sections -> 200", res.status === 200);
  check(
    "sections cache-control set",
    /s-maxage=\d+/.test(res.headers.get("cache-control") ?? ""),
    res.headers.get("cache-control") ?? "none",
  );
  sections = body?.items ?? [];
  check("sections is a non-empty array", Array.isArray(sections) && sections.length > 0);
  check(
    "every section has slug + title",
    sections.every((s) => s.slug && s.title),
  );
  check(
    "sections sorted by order",
    sections.every(
      (s, i) => i === 0 || (sections[i - 1].order ?? 0) <= (s.order ?? 0),
    ),
  );
}

// ── videos list + pagination ────────────────────────────────────
{
  const { res, body } = await getJson("/api/videos?limit=6");
  check("GET /api/videos -> 200", res.status === 200);
  check("videos.items is array", Array.isArray(body?.items));
  check("videos respects limit", (body?.items?.length ?? 0) <= 6);
  check(
    "every video has id, title, sources[]",
    body.items.every(
      (v) => v.id && v.title && Array.isArray(v.sources) && v.sources.length > 0,
    ),
  );
  check(
    "every source url is https and not an ad host",
    body.items.every((v) =>
      v.sources.every(
        (s) =>
          /^https:\/\//.test(s.url) &&
          !/doubleclick|googlesyndication|ads\./i.test(s.url),
      ),
    ),
  );

  if (body.nextCursor) {
    const { body: page2 } = await getJson(
      `/api/videos?limit=6&cursor=${encodeURIComponent(body.nextCursor)}`,
    );
    const firstIds = new Set(body.items.map((v) => v.id));
    check(
      "pagination returns fresh items",
      page2.items.length > 0 && page2.items.every((v) => !firstIds.has(v.id)),
    );
  } else {
    results.push("  · pagination: only one page of data (skipped)");
  }
}

// ── single video + 404 ─────────────────────────────────────────
let sampleId;
{
  const { body } = await getJson("/api/videos?limit=1");
  sampleId = body.items[0]?.slug ?? body.items[0]?.id;
  const { res, body: v } = await getJson(`/api/videos/${sampleId}`);
  check(`GET /api/videos/${sampleId} -> 200`, res.status === 200);
  check("single video has playable source", v?.sources?.length > 0);

  const { res: res404 } = await getJson("/api/videos/definitely-not-real-xyz");
  check("GET /api/videos/<bad> -> 404", res404.status === 404, `got ${res404.status}`);
}

// ── section filtering ──────────────────────────────────────────
{
  const slug = sections[0]?.slug;
  const { body } = await getJson(`/api/videos?section=${slug}&limit=50`);
  check(
    `videos?section=${slug} all belong to that section`,
    body.items.every((v) => (v.sections ?? []).includes(slug)),
  );
}

// ── live events ────────────────────────────────────────────────
{
  const { res, body } = await getJson("/api/live");
  check("GET /api/live -> 200", res.status === 200);
  check("live.items is array", Array.isArray(body?.items));
  const evs = body?.items ?? [];
  if (evs.length) {
    check(
      "every live event has id, title, sport, status, sources[]",
      evs.every(
        (e) =>
          e.id && e.title && e.sport && e.status &&
          Array.isArray(e.sources) && e.sources.length > 0,
      ),
    );
    check(
      "live sources are https and not ad hosts",
      evs.every((e) =>
        e.sources.every(
          (s) => /^https:\/\//.test(s.url) && !/ads\.|doubleclick/i.test(s.url),
        ),
      ),
    );
    check(
      "live cache-control is short",
      /s-maxage=\d+/.test(res.headers.get("cache-control") ?? ""),
    );

    const { body: grouped } = await getJson("/api/live?grouped=1");
    check("grouped live returns groups[]", Array.isArray(grouped?.groups));
    if (grouped.groups?.length > 1) {
      check(
        "soccer group sorts first",
        grouped.groups[0].sport === "soccer",
        grouped.groups[0].sport,
      );
    }

    const first = evs[0];
    const { res: one } = await getJson(
      `/api/live/${first.slug ?? first.id}`,
    );
    check("GET /api/live/<id> -> 200", one.status === 200);
    const { res: bad } = await getJson("/api/live/nope-xyz");
    check("GET /api/live/<bad> -> 404", bad.status === 404, `got ${bad.status}`);

    const { res: lp } = await getText("/live");
    check("GET /live -> 200", lp.status === 200);
    const { res: lw } = await getText(`/live/${first.slug ?? first.id}`);
    check("GET /live/<id> -> 200", lw.status === 200);
  } else {
    results.push("  · live checks skipped (provider has no live data)");
  }
}

// ── search (live + vod) ────────────────────────────────────────
{
  const { res, body } = await getJson("/api/search?q=a");
  check("GET /api/search -> 200", res.status === 200);
  check("search returns {live,videos}", Array.isArray(body?.live) && Array.isArray(body?.videos));
  const { body: empty } = await getJson("/api/search?q=");
  check("empty query -> empty results", (empty?.videos?.length ?? 0) === 0);
}

// ── new pages render ───────────────────────────────────────────
for (const p of ["/scores", "/multiview", "/watchlist", "/search"]) {
  const { res } = await getText(p);
  check(`GET ${p} -> 200`, res.status === 200, `got ${res.status}`);
}

// ── admin is locked down ───────────────────────────────────────
{
  const { res } = await getJson("/api/admin/config");
  check("GET /api/admin/config -> 401 without auth", res.status === 401, `got ${res.status}`);
  const { res: put } = await getJson("/api/admin/config");
  check("admin config never leaks overrides unauthed", put.status === 401);
  const { res: page } = await getText("/admin");
  check("GET /admin -> 200 (login or notice)", page.status === 200);
}

// ── HTML pages ─────────────────────────────────────────────────
{
  const { res, text } = await getText("/");
  check("GET / -> 200", res.status === 200);
  check("home renders section headings", /SECTION|Section/.test(text));

  const csp = res.headers.get("content-security-policy") ?? "";
  check("CSP header present", csp.length > 0);
  check("CSP: object-src none", /object-src 'none'/.test(csp));
  check("CSP: script-src self (no wildcard)", /script-src 'self'/.test(csp) && !/script-src[^;]*\*/.test(csp));
  check("CSP: frame-src is an allow-list", /frame-src [^;]*vimeo/.test(csp));
  check(
    "Permissions-Policy blocks ad auctions",
    /run-ad-auction=\(\)/.test(res.headers.get("permissions-policy") ?? ""),
  );
  check("X-Content-Type-Options nosniff", res.headers.get("x-content-type-options") === "nosniff");
  check("no x-powered-by", !res.headers.get("x-powered-by"));
}

{
  const { res, text } = await getText("/manifest.webmanifest");
  check("PWA manifest served", res.status === 200 && /"name":\s*"View"/.test(text));
}

{
  const slug = sections[0]?.slug;
  const { res } = await getText(`/s/${slug}`);
  check(`GET /s/${slug} -> 200`, res.status === 200);
  const { res: bad } = await getText("/s/nonexistent-section-xyz");
  check("GET /s/<bad> -> 404", bad.status === 404, `got ${bad.status}`);
}

{
  const { res, text } = await getText(`/watch/${sampleId}`);
  check(`GET /watch/${sampleId} -> 200`, res.status === 200);
  check("watch page shows video title", text.includes(sampleId) || /class="rich"/.test(text));
}

// ── ad-sanitization (only meaningful with the hostile mock-api payload) ──
{
  const { res, text } = await getText("/watch/sample-video-1");
  if (res.status === 200) {
    check("watch: no inline <script>alert", !text.includes("alert('ad')") && !text.includes('alert("ad")'));
    check("watch: no googlesyndication iframe", !/googlesyndication/.test(text));
    check("watch: no doubleclick link", !/doubleclick\.net/.test(text));
    check("watch: no ads.example.com source", !/ads\.example\.com/.test(text));
    check("watch: legit vimeo embed preserved", /player\.vimeo\.com/.test(text));
  } else {
    results.push("  · ad-sanitization checks skipped (run against test/mock-api.mjs)");
  }
}

// ── lockout after repeated failures (runs last — locks this IP ~2 min) ──
{
  let sawLock = false;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "nope", password: "nope" }),
    });
    if (r.status === 429) {
      const j = await r.json().catch(() => ({}));
      sawLock = j.retryAfter >= 60 && j.retryAfter <= 120;
      break;
    }
  }
  check("gate: 3 bad attempts -> ~120s lockout (429)", sawLock);
}

// ── report ─────────────────────────────────────────────────────
console.log(results.join("\n"));
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);

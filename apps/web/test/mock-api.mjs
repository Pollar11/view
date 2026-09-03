/**
 * Reference implementation of the API contract View's `rest` provider expects.
 * Run it, point View at it, and you have a working end-to-end integration you
 * can diff your real backend against.
 *
 *   node test/mock-api.mjs                # serves on http://localhost:4000
 *   CONTENT_PROVIDER=rest SITE_API_URL=http://localhost:4000 npm run dev
 *
 * It deliberately includes hostile data (ad <script>, doubleclick iframe,
 * a source on an ad host) so you can confirm View strips all of it.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 4000);

const SECTIONS = [
  { slug: "featured", title: "Featured", order: 0, layout: "rail" },
  { slug: "news", title: "News", order: 1, layout: "grid" },
  { slug: "docs", title: "Documentaries", order: 2, layout: "rail" },
];

const VIDEOS = Array.from({ length: 23 }, (_, i) => {
  const n = i + 1;
  return {
    id: `vid-${n}`,
    slug: `sample-video-${n}`,
    title: `Sample Video ${n}`,
    description:
      n === 1
        ? // hostile payload — must be neutralised by View
          `<p>Legit copy.</p><script>alert('ad')</script>` +
          `<iframe src="https://tpc.googlesyndication.com/x"></iframe>` +
          `<a href="https://doubleclick.net/track">sketchy link</a>` +
          `<iframe src="https://player.vimeo.com/video/76979871" width="640" height="360" allowfullscreen></iframe>`
        : `<p>Description for sample video ${n}.</p>`,
    thumbnail: `https://picsum.photos/seed/view${n}/640/360`,
    sources:
      n === 1
        ? [
            { url: "https://ads.example.com/preroll.mp4", type: "video/mp4" }, // blocked host -> dropped
            {
              url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
              type: "application/x-mpegURL",
              label: "Auto",
            },
          ]
        : [
            {
              url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${
                ["BigBuckBunny", "ElephantsDream", "Sintel", "TearsOfSteel"][n % 4]
              }.mp4`,
              type: "video/mp4",
              label: "720p",
            },
          ],
    durationSeconds: 60 + n * 7,
    publishedAt: new Date(Date.UTC(2025, 0, 1) - i * 86400000).toISOString(),
    views: 1000 * n,
    sections: [
      ["featured", "news", "docs"][n % 3],
      n % 4 === 0 ? "featured" : null,
    ].filter(Boolean),
    tags: ["sample", n % 2 ? "odd" : "even"],
    canonicalUrl: `https://yoursite.example/watch/vid-${n}`,
  };
});

const LL_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const now = Date.parse("2025-01-01T15:00:00Z"); // fixed for deterministic tests
const LIVE = [
  {
    id: "ev-sccr-1", slug: "arsenal-vs-chelsea", title: "Arsenal vs Chelsea",
    sport: "soccer", sportLabel: "Soccer", competition: "Premier League",
    status: "live", startsAt: new Date(now - 30 * 60000).toISOString(),
    thumbnail: "https://picsum.photos/seed/ev1/640/360",
    home: "Arsenal", away: "Chelsea", score: { home: 1, away: 0 }, viewers: 90210,
    sources: [
      { url: "https://ads.example.com/preroll.m3u8", type: "application/x-mpegURL" },
      { url: LL_HLS, type: "application/x-mpegURL", label: "Auto" },
    ],
    previewSource: { url: LL_HLS, type: "application/x-mpegURL" },
    canonicalUrl: "https://yoursite.example/live/ev-sccr-1",
  },
  {
    id: "ev-sccr-2", slug: "real-vs-barca", title: "Real Madrid vs Barcelona",
    sport: "soccer", sportLabel: "Soccer", competition: "LaLiga",
    status: "live", startsAt: new Date(now - 10 * 60000).toISOString(),
    thumbnail: "https://picsum.photos/seed/ev2/640/360",
    home: "Real Madrid", away: "Barcelona", score: { home: 0, away: 0 }, viewers: 240000,
    sources: [{ url: LL_HLS, type: "application/x-mpegURL" }],
  },
  {
    id: "ev-bkb-1", slug: "lakers-vs-celtics", title: "Lakers vs Celtics",
    sport: "basketball", sportLabel: "Basketball", competition: "NBA",
    status: "live", startsAt: new Date(now - 40 * 60000).toISOString(),
    thumbnail: "https://picsum.photos/seed/ev3/640/360",
    home: "Lakers", away: "Celtics", score: { home: 70, away: 66 }, viewers: 40000,
    sources: [{ url: LL_HLS, type: "application/x-mpegURL" }],
  },
  {
    id: "ev-tns-1", slug: "alcaraz-vs-sinner", title: "Alcaraz vs Sinner",
    sport: "tennis", sportLabel: "Tennis", competition: "ATP Finals",
    status: "upcoming", startsAt: new Date(now + 90 * 60000).toISOString(),
    thumbnail: "https://picsum.photos/seed/ev4/640/360",
    home: "Alcaraz", away: "Sinner", viewers: 0,
    sources: [{ url: LL_HLS, type: "application/x-mpegURL" }],
  },
];

const json = (res, code, body) => {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split("/").filter(Boolean);

  // GET /sections
  if (req.method === "GET" && parts[0] === "sections" && parts.length === 1) {
    return json(res, 200, SECTIONS);
  }

  // GET /feed.xml  — Media RSS feed for exercising CONTENT_PROVIDER=rss
  if (req.method === "GET" && parts[0] === "feed.xml") {
    const items = VIDEOS.slice(0, 10)
      .map(
        (v) => `    <item>
      <title>${v.title}</title>
      <guid isPermaLink="false">${v.id}</guid>
      <link>${v.canonicalUrl}</link>
      <pubDate>${new Date(v.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${v.description}]]></description>
      <media:content url="${
        v.sources.find((s) => !/ads\./.test(s.url))?.url
      }" medium="video" type="video/mp4"/>
      <media:thumbnail url="${v.thumbnail}"/>
    </item>`,
      )
      .join("\n");
    res.writeHead(200, { "Content-Type": "application/rss+xml" });
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Mock Video Feed</title>
    <link>http://localhost:${PORT}</link>
    <description>Test feed</description>
${items}
  </channel>
</rss>`);
  }

  // GET /live  and  GET /live/:id
  if (req.method === "GET" && parts[0] === "live") {
    if (parts.length === 2) {
      const e = LIVE.find((x) => x.id === parts[1] || x.slug === parts[1]);
      return e ? json(res, 200, e) : json(res, 404, { error: "not found" });
    }
    const sport = url.searchParams.get("sport");
    const status = url.searchParams.get("status");
    let items = LIVE.slice();
    if (sport) items = items.filter((e) => e.sport === sport);
    if (status) items = items.filter((e) => e.status === status);
    return json(res, 200, { items });
  }

  // GET /videos  and  GET /videos/:id
  if (req.method === "GET" && parts[0] === "videos") {
    if (parts.length === 2) {
      const v = VIDEOS.find((x) => x.id === parts[1] || x.slug === parts[1]);
      return v ? json(res, 200, v) : json(res, 404, { error: "not found" });
    }
    const section = url.searchParams.get("section");
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 12), 50);
    const cursor = Number(url.searchParams.get("cursor") ?? 0) || 0;

    let items = VIDEOS.slice();
    if (section) items = items.filter((v) => v.sections.includes(section));
    if (q)
      items = items.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.includes(q)),
      );
    items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    const slice = items.slice(cursor, cursor + limit);
    const nextCursor =
      cursor + limit < items.length ? String(cursor + limit) : null;
    return json(res, 200, { items: slice, nextCursor });
  }

  json(res, 404, { error: "unknown route", path: url.pathname });
});

server.listen(PORT, () => {
  console.log(`mock-api listening on http://localhost:${PORT}`);
  console.log(`  GET /sections`);
  console.log(`  GET /videos?section=&cursor=&limit=&q=`);
  console.log(`  GET /videos/:idOrSlug`);
});

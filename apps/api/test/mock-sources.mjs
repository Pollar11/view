/**
 * Reference implementations of the three source shapes, on one HTTP server:
 *
 *   /api/items?category=      -> official JSON API  (source 1)
 *   /flicks , /flicks/:slug   -> HTML movie site    (source 2, scraped)
 *   /fixtures , /fixtures/:s  -> HTML sports site    (source 3, scraped)
 *
 * The HTML pages intentionally embed hostile / identifying content — absolute
 * URLs, the site's own brand name, an inline <script>, an email address — so
 * the e2e test can prove the API strips all of it.
 */
import { createServer } from 'node:http';

const BRAND2 = 'FlickHaven';
const BRAND3 = 'MatchStream Pro';

const MOVIES = [
  { slug: 'the-glass-orchard', title: 'The Glass Orchard', genre: ['Drama', 'Mystery'], year: 2024, rating: 78, cast: ['R. Awad', 'T. Lindqvist'] },
  { slug: 'lantern-9', title: 'Lantern 9', genre: ['Sci-Fi'], year: 2025, rating: 82, cast: ['M. Okafor'] },
  { slug: 'the-quiet-coast', title: 'The Quiet Coast', genre: ['Drama'], year: 2023, rating: 71, cast: ['J. Meyer'] },
];
const FIXTURES = [
  { slug: 'united-vs-city', home: 'United', away: 'City', competition: 'Premier Division', inHours: 5 },
  { slug: 'north-vs-south', home: 'North', away: 'South', competition: 'Cup Quarter-final', inHours: 26 },
];

const apiItems = (category) => {
  if (category === 'movies') {
    return MOVIES.map((m) => ({
      id: m.slug,
      title: m.title,
      description: `${m.title} — a feature presentation. Visit https://api.example-movies.test/${m.slug} for details. Contact press@example-movies.test.`,
      category: 'movies',
      genres: m.genre,
      year: m.year,
      rating: m.rating,
      cast: m.cast,
      poster: `https://cdn.example-movies.test/${m.slug}.jpg`,
      url: `https://api.example-movies.test/watch/${m.slug}`,
      releaseDate: `${m.year}-03-01`,
    }));
  }
  return [];
};

function moviePage(m) {
  return `<!doctype html><html><head>
<title>${m.title} (${m.year}) — ${BRAND2}</title>
<meta name="description" content="Watch ${m.title} on ${BRAND2}. Read more at https://flickhaven.test/movie/${m.slug}. Questions? hello@flickhaven.test">
<meta property="og:title" content="${m.title} — ${BRAND2}">
<meta property="og:type" content="video.movie">
<meta property="og:image" content="https://img.flickhaven.test/${m.slug}/poster.jpg">
<meta property="video:release_date" content="${m.year}-05-10">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: m.title,
    description: `${m.title} is streaming now on ${BRAND2}. Full catalogue at https://flickhaven.test.`,
    genre: m.genre,
    datePublished: `${m.year}-05-10`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: (m.rating / 10).toFixed(1) },
    image: `https://img.flickhaven.test/${m.slug}/poster.jpg`,
    actor: m.cast.map((n) => ({ '@type': 'Person', name: n })),
  })}</script>
<script>window.__tracker = 'flickhaven-analytics'; console.log('tracking pixel');</script>
</head><body>
<h1>${m.title}</h1>
<p>${m.title} (${m.year}) streaming on ${BRAND2}. Visit flickhaven.test for more.</p>
<video><source src="https://stream.flickhaven.test/${m.slug}/master.m3u8" type="application/x-mpegURL"></video>
</body></html>`;
}

function fixturePage(f) {
  const startDate = new Date(Date.now() + f.inHours * 3600_000).toISOString();
  return `<!doctype html><html><head>
<title>${f.home} vs ${f.away} — ${f.competition} live on ${BRAND3}</title>
<meta name="description" content="${f.home} vs ${f.away} in the ${f.competition}. Live coverage on ${BRAND3} — matchstream.test/live/${f.slug}.">
<meta property="og:title" content="${f.home} vs ${f.away} — ${BRAND3}">
<meta property="og:type" content="video.other">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${f.home} vs ${f.away}`,
    description: `${f.competition}. Watch live on ${BRAND3} at https://matchstream.test/live/${f.slug}.`,
    startDate,
    competitor: [
      { '@type': 'SportsTeam', name: f.home },
      { '@type': 'SportsTeam', name: f.away },
    ],
  })}</script>
</head><body>
<h1>${f.home} vs ${f.away}</h1>
<iframe src="https://player.matchstream.test/embed/${f.slug}"></iframe>
</body></html>`;
}

function listPage(title, links) {
  return `<!doctype html><html><head><title>${title}</title></head><body><ul>${links
    .map((l) => `<li><a href="${l}">link</a></li>`)
    .join('')}</ul></body></html>`;
}

export function startMockSources(port = 0) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;

    if (p === '/robots.txt') {
      res.setHeader('content-type', 'text/plain');
      res.end('User-agent: *\nDisallow: /private\nCrawl-delay: 0\n');
      return;
    }

    // Source 1 — official API
    if (p === '/api/items') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ items: apiItems(url.searchParams.get('category')) }));
      return;
    }

    // Source 2 — HTML movie site
    if (p === '/flicks') {
      res.setHeader('content-type', 'text/html');
      res.end(listPage(`${BRAND2} — Browse`, MOVIES.map((m) => `/flicks/${m.slug}`)));
      return;
    }
    const mMovie = /^\/flicks\/([\w-]+)$/.exec(p);
    if (mMovie) {
      const m = MOVIES.find((x) => x.slug === mMovie[1]);
      if (!m) { res.statusCode = 404; res.end('nope'); return; }
      res.setHeader('content-type', 'text/html');
      res.end(moviePage(m));
      return;
    }

    // Source 3 — HTML sports site
    if (p === '/fixtures') {
      res.setHeader('content-type', 'text/html');
      res.end(listPage(`${BRAND3} — Fixtures`, FIXTURES.map((f) => `/fixtures/${f.slug}`)));
      return;
    }
    const mFix = /^\/fixtures\/([\w-]+)$/.exec(p);
    if (mFix) {
      const f = FIXTURES.find((x) => x.slug === mFix[1]);
      if (!f) { res.statusCode = 404; res.end('nope'); return; }
      res.setHeader('content-type', 'text/html');
      res.end(fixturePage(f));
      return;
    }

    res.statusCode = 404;
    res.end('not found');
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const { port: actual } = server.address();
      resolve({
        server,
        origin: `http://127.0.0.1:${actual}`,
        brands: [BRAND2, BRAND3],
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

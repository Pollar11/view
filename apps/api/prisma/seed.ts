/**
 * Demo catalogue + demo user so the app is fully explorable with no sources
 * configured. Safe to run repeatedly (idempotent upserts).
 *
 *   npm run seed            (from apps/api)
 *
 * Demo login:  demo@view.app  /  DemoPass123
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_SOURCE = 'seed';

type Seed = {
  title: string;
  description: string;
  category: 'movies' | 'sports' | 'documentaries';
  genres: string[];
  tags: string[];
  year?: number;
  rating?: number;
  startsInHours?: number;
  popularity?: number;
};

const MOVIES: Seed[] = [
  { title: 'Neon Meridian', description: 'A courier in a rain-soaked megacity discovers the parcel she is carrying can rewrite a single day.', category: 'movies', genres: ['Sci-Fi', 'Thriller'], tags: ['cyberpunk', 'heist'], year: 2024, rating: 7.8, popularity: 14 },
  { title: 'The Salt Path Home', description: 'Two estranged siblings walk a coastal trail to scatter their mother’s ashes and relearn each other.', category: 'movies', genres: ['Drama'], tags: ['road trip', 'family'], year: 2023, rating: 7.4, popularity: 9 },
  { title: 'Paper Lanterns', description: 'An animator working nights on a failing film finds her sketches leaking into the waking world.', category: 'movies', genres: ['Animation', 'Fantasy'], tags: ['hand-drawn', 'magical realism'], year: 2025, rating: 8.1, popularity: 17 },
  { title: 'Cold Open', description: 'A late-night comedy writer has one weekend to save the show and possibly her marriage.', category: 'movies', genres: ['Comedy', 'Drama'], tags: ['backstage', 'ensemble'], year: 2022, rating: 6.9, popularity: 6 },
  { title: 'Undertow', description: 'A free-diving instructor is pulled into a search for a wreck that the sea does not want found.', category: 'movies', genres: ['Adventure', 'Mystery'], tags: ['ocean', 'survival'], year: 2024, rating: 7.1, popularity: 11 },
  { title: 'The Cartographer’s Daughter', description: 'In a country being redrawn by war, a teenager hides refugees along routes only she can map.', category: 'movies', genres: ['Drama', 'History'], tags: ['war', 'coming of age'], year: 2021, rating: 8.3, popularity: 12 },
  { title: 'Static', description: 'A radio host in a small desert town starts receiving calls from the following week.', category: 'movies', genres: ['Sci-Fi', 'Horror'], tags: ['small town', 'time loop'], year: 2025, rating: 7.6, popularity: 15 },
  { title: 'Grand Bassin', description: 'A chef returns to the island she left at seventeen to cook one last service in her father’s kitchen.', category: 'movies', genres: ['Drama'], tags: ['food', 'grief'], year: 2023, rating: 7.9, popularity: 10 },
];

const DOCS: Seed[] = [
  { title: 'The Long Count', description: 'Astronomers race a decaying orbit to recover forty years of climate data from a dying satellite.', category: 'documentaries', genres: ['Science', 'Nature'], tags: ['space', 'climate'], year: 2024, rating: 8.0, popularity: 13 },
  { title: 'Hand Over Hand', description: 'Three generations of a rope-making family adapt a craft the modern shipping industry forgot.', category: 'documentaries', genres: ['Society', 'History'], tags: ['craft', 'labour'], year: 2023, rating: 7.7, popularity: 7 },
  { title: 'Migration Pattern', description: 'A year following wildlife wardens and herders negotiating the same shrinking corridor.', category: 'documentaries', genres: ['Nature', 'Society'], tags: ['wildlife', 'conservation'], year: 2025, rating: 8.4, popularity: 16 },
  { title: 'The Model Village', description: 'A retired engineer has spent 22 years building a 1:9 scale replica of the town that displaced him.', category: 'documentaries', genres: ['Art', 'Society'], tags: ['obsession', 'memory'], year: 2022, rating: 7.5, popularity: 6 },
  { title: 'Deep Field', description: 'The people who keep the world’s largest radio telescope array running through the night shift.', category: 'documentaries', genres: ['Science', 'Technology'], tags: ['astronomy', 'engineering'], year: 2024, rating: 8.2, popularity: 12 },
  { title: 'Second Harvest', description: 'A cooperative turns a region’s food waste into a supply chain feeding forty thousand people.', category: 'documentaries', genres: ['Society', 'Food'], tags: ['sustainability', 'community'], year: 2023, rating: 7.8, popularity: 9 },
];

const SPORTS: Seed[] = [
  { title: 'Harbour City vs Northgate United', description: 'Top-of-the-table clash with both sides unbeaten in their last six.', category: 'sports', genres: ['Football'], tags: ['league', 'derby'], startsInHours: 3, popularity: 20 },
  { title: 'Riverside Open — Semi-finals', description: 'Two former champions meet a round earlier than the bracket predicted.', category: 'sports', genres: ['Tennis'], tags: ['singles', 'hard court'], startsInHours: 20, popularity: 15 },
  { title: 'Cape Marathon', description: 'Elite field targeting a course record on a cool, still morning.', category: 'sports', genres: ['Athletics'], tags: ['road', 'endurance'], startsInHours: 44, popularity: 11 },
  { title: 'Eastern Conference Final — Game 5', description: 'Series tied 2–2, home side rested, road side on a back-to-back.', category: 'sports', genres: ['Basketball'], tags: ['playoffs'], startsInHours: 8, popularity: 18 },
  { title: 'National Road Race Championship', description: 'A lumpy finishing circuit that rarely comes down to a bunch sprint.', category: 'sports', genres: ['Cycling'], tags: ['road', 'one-day'], startsInHours: 30, popularity: 8 },
  { title: 'Test Match — Day 3', description: 'First innings lead of 74 with the pitch starting to take spin.', category: 'sports', genres: ['Cricket'], tags: ['test', 'session play'], startsInHours: 15, popularity: 10 },
  { title: 'Grand Prix — Qualifying', description: 'Rain expected in the final ten minutes of Q3.', category: 'sports', genres: ['Motorsport'], tags: ['qualifying', 'street circuit'], startsInHours: 26, popularity: 17 },
];

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
}
function genresKey(genres: string[]): string {
  return genres.length ? `|${genres.map((g) => g.toLowerCase().replace(/\s+/g, '-')).join('|')}|` : '';
}

async function main(): Promise<void> {
  const all = [...MOVIES, ...DOCS, ...SPORTS];
  let n = 0;
  for (const s of all) {
    const externalId = slugify(s.title);
    const startsAt = s.startsInHours != null ? new Date(Date.now() + s.startsInHours * 3600_000) : null;
    await prisma.item.upsert({
      where: { sourceId_externalId: { sourceId: DEMO_SOURCE, externalId } },
      update: {
        title: s.title,
        description: s.description,
        category: s.category,
        year: s.year ?? null,
        rating: s.rating ?? null,
        startsAt,
        genresKey: genresKey(s.genres),
        genresJson: JSON.stringify(s.genres),
        tagsJson: JSON.stringify(s.tags),
      },
      create: {
        slug: externalId,
        title: s.title,
        description: s.description,
        category: s.category,
        year: s.year ?? null,
        rating: s.rating ?? null,
        startsAt,
        genresKey: genresKey(s.genres),
        genresJson: JSON.stringify(s.genres),
        tagsJson: JSON.stringify(s.tags),
        popularity: s.popularity ?? 3,
        sourceId: DEMO_SOURCE,
        sourceKind: 'api',
        externalId,
        sourcePageUrl: `https://source.example/${s.category}/${externalId}`,
      },
    });
    n++;
  }

  const passwordHash = await bcrypt.hash('DemoPass123', 12);
  await prisma.user.upsert({
    where: { email: 'demo@view.app' },
    update: {},
    create: {
      email: 'demo@view.app',
      passwordHash,
      displayName: 'Demo Viewer',
      preferenceJson: JSON.stringify({ favoriteCategories: ['movies', 'documentaries'], favoriteGenres: ['sci-fi', 'science'] }),
    },
  });

  console.log(`Seeded ${n} items + demo user (demo@view.app / DemoPass123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

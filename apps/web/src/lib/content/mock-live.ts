import type { LiveEvent } from "@/lib/types";

/**
 * Demo live events. The "sources" point at a public test HLS stream so the wall
 * and low-latency player are exercisable without a real live origin. Soccer is
 * listed first; ordering in the UI is driven by config.sportOrder, not by this
 * array.
 */
const LL_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const shot = (seed: string) => `https://picsum.photos/seed/${seed}/640/360`;

function mk(
  partial: Omit<LiveEvent, "sources" | "previewSource"> &
    Partial<Pick<LiveEvent, "sources" | "previewSource">>,
): LiveEvent {
  return {
    sources: [
      { url: LL_HLS, type: "application/x-mpegURL", label: "Auto" },
    ],
    previewSource: { url: LL_HLS, type: "application/x-mpegURL", label: "Preview" },
    ...partial,
  };
}

export const MOCK_LIVE: LiveEvent[] = [
  mk({
    id: "sccr-ars-che",
    slug: "arsenal-vs-chelsea",
    title: "Arsenal vs Chelsea",
    sport: "soccer",
    sportLabel: "Soccer",
    competition: "Premier League",
    status: "live",
    startsAt: new Date(Date.now() - 32 * 60_000).toISOString(),
    thumbnail: shot("soccer-arsenal"),
    home: "Arsenal",
    away: "Chelsea",
    score: { home: 1, away: 1 },
    viewers: 84210,
  }),
  mk({
    id: "sccr-rma-fcb",
    slug: "real-madrid-vs-barcelona",
    title: "Real Madrid vs Barcelona",
    sport: "soccer",
    sportLabel: "Soccer",
    competition: "LaLiga",
    status: "live",
    startsAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    thumbnail: shot("soccer-clasico"),
    home: "Real Madrid",
    away: "Barcelona",
    score: { home: 0, away: 0 },
    viewers: 220145,
  }),
  mk({
    id: "sccr-bay-dor",
    slug: "bayern-vs-dortmund",
    title: "Bayern vs Dortmund",
    sport: "soccer",
    sportLabel: "Soccer",
    competition: "Bundesliga",
    status: "upcoming",
    startsAt: new Date(Date.now() + 55 * 60_000).toISOString(),
    thumbnail: shot("soccer-klassiker"),
    home: "Bayern",
    away: "Dortmund",
    viewers: 0,
  }),
  mk({
    id: "bkb-lal-bos",
    slug: "lakers-vs-celtics",
    title: "Lakers vs Celtics",
    sport: "basketball",
    sportLabel: "Basketball",
    competition: "NBA",
    status: "live",
    startsAt: new Date(Date.now() - 48 * 60_000).toISOString(),
    thumbnail: shot("nba-lakers"),
    home: "Lakers",
    away: "Celtics",
    score: { home: 71, away: 68 },
    viewers: 51120,
  }),
  mk({
    id: "tns-alcaraz-sinner",
    slug: "alcaraz-vs-sinner",
    title: "Alcaraz vs Sinner",
    sport: "tennis",
    sportLabel: "Tennis",
    competition: "ATP Finals",
    status: "live",
    startsAt: new Date(Date.now() - 70 * 60_000).toISOString(),
    thumbnail: shot("tennis-atp"),
    home: "Alcaraz",
    away: "Sinner",
    score: { home: 1, away: 1 },
    viewers: 33540,
  }),
  mk({
    id: "f1-monza-race",
    slug: "italian-grand-prix",
    title: "Italian Grand Prix — Race",
    sport: "motorsport",
    sportLabel: "Motorsport",
    competition: "Formula 1",
    status: "live",
    startsAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    thumbnail: shot("f1-monza"),
    viewers: 96010,
  }),
  mk({
    id: "crk-ind-aus",
    slug: "india-vs-australia",
    title: "India vs Australia",
    sport: "cricket",
    sportLabel: "Cricket",
    competition: "ODI Series",
    status: "live",
    startsAt: new Date(Date.now() - 130 * 60_000).toISOString(),
    thumbnail: shot("cricket-ind"),
    home: "IND",
    away: "AUS",
    score: { home: 214, away: 0 },
    viewers: 145880,
  }),
  mk({
    id: "nfl-kc-buf",
    slug: "chiefs-vs-bills",
    title: "Chiefs vs Bills",
    sport: "americanfootball",
    sportLabel: "American Football",
    competition: "NFL",
    status: "upcoming",
    startsAt: new Date(Date.now() + 180 * 60_000).toISOString(),
    thumbnail: shot("nfl-chiefs"),
    home: "Chiefs",
    away: "Bills",
    viewers: 0,
  }),
];

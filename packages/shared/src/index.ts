/**
 * Shared contract between the View API and the View app.
 *
 * NOTE: nothing in here references a source website. The API strips every
 * upstream URL, site name and identifier before an item is serialised, so
 * these types intentionally have no `sourceUrl` / `streamUrl` field.
 */

export const CATEGORIES = ['movies', 'sports', 'documentaries'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

/** A single aggregated catalogue entry — metadata only. */
export interface Item {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  genres: string[];
  year: number | null;
  /** Free-form, already-sanitised metadata (cast, league, runtime label, …). */
  tags: string[];
  rating: number | null;
  /** Opaque poster/thumbnail served through the API's image proxy. */
  posterUrl: string | null;
  /** ISO date the upstream item was published, when known. */
  releasedAt: string | null;
  /** For sports: kickoff time. Drives "upcoming match" notifications. */
  startsAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Aggregate signal used by the recommender and "trending" rails. */
  popularity: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ItemQuery {
  category?: Category;
  genre?: string;
  year?: number;
  q?: string;
  sort?: 'newest' | 'popular' | 'rating' | 'title';
  page?: number;
  limit?: number;
}

/* ----------------------------- auth ----------------------------- */

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoriteCategories: Category[];
  favoriteGenres: string[];
  /** Opt-in to local "upcoming match" notifications. */
  matchNotifications: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

/* ------------------------- interactions ------------------------- */

export const INTERACTION_TYPES = ['view', 'favorite', 'unfavorite', 'rating'] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export interface InteractionDto {
  itemId: string;
  type: InteractionType;
  /** Required when type === 'rating' (1–5). */
  value?: number;
}

export interface Interaction {
  id: string;
  itemId: string;
  type: InteractionType;
  value: number | null;
  createdAt: string;
}

/* ----------------------- recommendations ----------------------- */

export interface Recommendation {
  item: Item;
  score: number;
  reason: string;
}

/* --------------------------- sections -------------------------- */

/** A titled, ordered rail for the Home screen. */
export interface HomeSection {
  key: string;
  title: string;
  kind: 'hero' | 'rail' | 'grid';
  items: Item[];
}

export interface HomeFeed {
  hero: Item[];
  sections: HomeSection[];
}

/* ----------------------------- misc --------------------------- */

export interface HealthReport {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  catalogue: { total: number; byCategory: Record<Category, number>; lastIngestAt: string | null };
  sources: { id: string; kind: 'api' | 'scrape'; ok: boolean; items: number; lastRunAt: string | null }[];
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

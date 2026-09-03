import type { Category } from '@view/shared';

/** Raw, pre-sanitisation item as pulled from a source. */
export interface RawItem {
  externalId: string;
  title: string;
  description?: string;
  category: Category;
  genres?: string[];
  tags?: string[];
  year?: number | null;
  rating?: number | null;
  posterUrl?: string | null;
  releasedAt?: string | null;
  startsAt?: string | null;
  /** Human-facing page on the source site. Stored server-side only. */
  sourcePageUrl: string;
}

export interface SourceContext {
  id: string;
  kind: 'api' | 'scrape';
  categories: Category[];
  itemCap: number;
}

export interface SourceAdapter {
  readonly id: string;
  readonly kind: 'api' | 'scrape';
  /** Pull up to `cap` items. Must never throw for partial failures — log & continue. */
  fetchItems(cap: number): Promise<RawItem[]>;
}

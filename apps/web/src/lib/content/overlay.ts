import { getOverrides } from "@/lib/overrides";
import type {
  ContentProvider,
  LiveEvent,
  LiveStatus,
  Page,
  Section,
  Video,
} from "@/lib/types";

/**
 * Applies /admin overrides (section visibility / order / titles / layout) to
 * whatever the underlying provider returns. Live + video payloads pass through
 * untouched; sport ordering and featured pins are applied at the page level via
 * getSportOrder() / getOverrides().
 */
export class OverlayProvider implements ContentProvider {
  name: string;
  constructor(private inner: ContentProvider) {
    this.name = inner.name;
  }

  async getSections(): Promise<Section[]> {
    const [sections, o] = await Promise.all([
      this.inner.getSections(),
      getOverrides(),
    ]);
    const ov = o.sections ?? {};
    return sections
      .filter((s) => !ov[s.slug]?.hidden)
      .map((s) => ({
        ...s,
        title: ov[s.slug]?.title ?? s.title,
        layout: ov[s.slug]?.layout ?? s.layout,
        order: ov[s.slug]?.order ?? s.order,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  getVideos(opts: Parameters<ContentProvider["getVideos"]>[0]): Promise<Page<Video>> {
    return this.inner.getVideos(opts);
  }
  getVideo(idOrSlug: string): Promise<Video | null> {
    return this.inner.getVideo(idOrSlug);
  }
  getLiveEvents(opts?: {
    sport?: string;
    status?: LiveStatus;
  }): Promise<LiveEvent[]> {
    return this.inner.getLiveEvents(opts);
  }
  getLiveEvent(idOrSlug: string): Promise<LiveEvent | null> {
    return this.inner.getLiveEvent
      ? this.inner.getLiveEvent(idOrSlug)
      : Promise.resolve(null);
  }
}

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProvider } from "@/lib/content";
import { Player } from "@/components/Player";
import { SafeHtml } from "@/components/SafeHtml";
import { VideoCard } from "@/components/VideoCard";
import { WatchlistButton } from "@/components/WatchlistButton";
import { formatDate, formatViews } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const v = await getProvider().getVideo(id);
    if (!v) return { title: "Not found" };
    return {
      title: v.title,
      description: v.description?.replace(/<[^>]+>/g, "").slice(0, 160),
      openGraph: {
        title: v.title,
        images: v.thumbnail ? [v.thumbnail] : undefined,
        type: "video.other",
      },
      alternates: v.canonicalUrl ? { canonical: v.canonicalUrl } : undefined,
    };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = getProvider();

  const video = await provider.getVideo(id).catch(() => null);
  if (!video || video.sources.length === 0) notFound();

  const relatedSection = video.sections?.[0];
  let related: Awaited<ReturnType<typeof provider.getVideos>>["items"] = [];
  if (relatedSection) {
    related = (
      await provider
        .getVideos({ section: relatedSection, limit: 8 })
        .catch(() => ({ items: [], nextCursor: null }))
    ).items.filter((v) => v.id !== video.id);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-6">
      <Player
        sources={video.sources}
        poster={video.thumbnail}
        title={video.title}
      />

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-medium tracking-[0.02em] md:text-2xl">
            {video.title}
          </h1>
          <WatchlistButton
            variant="full"
            item={{
              id: video.id,
              type: "video",
              title: video.title,
              href: `/watch/${video.slug ?? video.id}`,
              thumbnail: video.thumbnail,
            }}
          />
        </div>
        <p className="mt-2 text-[0.8rem] tracking-[0.06em] text-[var(--muted)]">
          {[formatViews(video.views), formatDate(video.publishedAt)]
            .filter(Boolean)
            .join("  ·  ")}
        </p>

        {video.sections && video.sections.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {video.sections.map((s) => (
              <Link
                key={s}
                href={`/s/${s}`}
                className="rounded-full border hairline px-3 py-1 text-[0.7rem] tracking-[0.08em] text-[var(--muted)] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
              >
                {s}
              </Link>
            ))}
          </div>
        )}

        <SafeHtml
          html={video.description}
          className="rich mt-6 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--muted)]"
        />

        {video.canonicalUrl && (
          <a
            href={video.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-[0.75rem] tracking-[0.08em] text-[var(--muted)] underline underline-offset-4"
          >
            View on original site ↗
          </a>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <p className="eyebrow">More from {relatedSection}</p>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
            {related.slice(0, 8).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

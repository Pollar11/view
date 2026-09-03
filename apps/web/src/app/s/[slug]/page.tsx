import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvider } from "@/lib/content";
import { VideoGrid } from "@/components/VideoGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sections = await safeSections();
  const section = sections.find((s) => s.slug === slug);
  return { title: section?.title ?? "Section" };
}

async function safeSections() {
  try {
    return await getProvider().getSections();
  } catch {
    return [];
  }
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = getProvider();
  const sections = await safeSections();
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();

  let initial;
  try {
    initial = await provider.getVideos({ section: slug, limit: 24 });
  } catch {
    initial = { items: [], nextCursor: null };
  }

  return (
    <div className="pt-10">
      <header className="mx-auto max-w-rail px-5 pb-8 md:px-10">
        <p className="eyebrow">Section</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[0.02em] md:text-4xl">
          {section.title}
        </h1>
        {section.description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            {section.description}
          </p>
        )}
      </header>
      <VideoGrid section={slug} initial={initial} />
    </div>
  );
}

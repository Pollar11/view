import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <Link href="/blog" className="text-sm font-semibold text-ink-light/70 hover:underline dark:text-ink-dark/70">
        ← Back to the blog
      </Link>
      <time className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink-light/70 dark:text-ink-dark/70" dateTime={post.date}>
        {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </time>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="prose-farm mt-6 space-y-4 text-ink-light/85 dark:text-ink-dark/85">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <Link href="/shop" className="btn-primary mt-10 inline-flex">
        Shop the farm
      </Link>
    </div>
  );
}

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Notes from the farm on pricing, sourcing, and how to order.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">From the farm</h1>
      <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
        Notes on pricing, sourcing, and how to order — written by the farm, not marketing copy.
      </p>

      <div className="mt-8 space-y-5">
        {BLOG_POSTS.slice()
          .sort((a, b) => +new Date(b.date) - +new Date(a.date))
          .map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <time className="text-xs font-semibold uppercase tracking-wide text-ink-light/70 dark:text-ink-dark/70" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
              <h2 className="mt-2 text-xl font-bold tracking-tight">{post.title}</h2>
              <p className="mt-2 text-sm text-ink-light/85 dark:text-ink-dark/85">{post.excerpt}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4 dark:text-accent-light">
                Read more →
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}

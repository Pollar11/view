import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { getOverrides, storeKind } from "@/lib/overrides";
import { getBaseProvider } from "@/lib/content";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-md px-5 pt-32 text-center">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 text-2xl font-medium">Not enabled</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Set <code>ADMIN_TOKEN</code> (min 8 chars) in your environment and
          redeploy to enable the admin panel.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) return <AdminLogin />;

  const [overrides, sections, live] = await Promise.all([
    getOverrides(),
    getBaseProvider().getSections(),
    getBaseProvider()
      .getLiveEvents()
      .catch(() => []),
  ]);

  return (
    <AdminPanel
      data={{
        store: storeKind(),
        overrides,
        sections: sections.map((s) => ({ slug: s.slug, title: s.title })),
        sports: [...new Set(live.map((e) => e.sport))],
      }}
    />
  );
}

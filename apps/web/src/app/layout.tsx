import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { Watermark } from "@/components/Watermark";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "View",
    template: "%s — View",
  },
  description: "A fast, ad-free way to watch.",
  applicationName: "View",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "View", statusBarStyle: "black-translucent" },
  // Raster icons/OG image are optional overrides — drop the files listed in
  // public/BRANDING.md and they are picked up automatically. The SVG works alone.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "View",
    description: "A fast, ad-free way to watch.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image", title: "View", images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sections: { slug: string; title: string }[] = [];
  try {
    sections = await getProvider().getSections();
  } catch {
    /* nav degrades gracefully */
  }

  return (
    <html lang="en">
      <body>
        <Watermark />
        <div className="relative z-10">
          <Nav sections={sections} />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </div>
        <CommandPalette sections={sections} />
      </body>
    </html>
  );
}

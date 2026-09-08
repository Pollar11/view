import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/store/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeInitScript } from "@/components/ThemeToggle";
import { ChatWidget } from "@/components/ChatWidget";
import { CookieConsent } from "@/components/CookieConsent";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { FARM_NAME, FARM_TAGLINE, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${FARM_NAME} — Farm-to-Door Sheep, Goat, Beef, Chicken, Duck & Rabbit`,
    template: `%s | ${FARM_NAME}`,
  },
  description: FARM_TAGLINE,
  openGraph: {
    type: "website",
    siteName: FARM_NAME,
    title: `${FARM_NAME} — Farm-to-Door Meat & Eggs`,
    description: FARM_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: `${FARM_NAME} — Farm-to-Door Meat & Eggs`,
    description: FARM_TAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e4" },
    { media: "(prefers-color-scheme: dark)", color: "#161310" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ChatWidget />
          <CookieConsent />
          <SiteAnalytics />
        </CartProvider>
      </body>
    </html>
  );
}

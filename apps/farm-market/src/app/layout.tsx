import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/store/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeInitScript } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Meadow & Market — Farm-to-Door Sheep, Goat, Chicken, Duck & Rabbit",
  description:
    "Pasture-raised sheep, goat, chicken, duck, rabbit, and farm-fresh eggs, cut to order and delivered straight to your door.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

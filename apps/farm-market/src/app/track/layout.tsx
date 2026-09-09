import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Find your order using the 6-character code from your confirmation page or text.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/track" },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirming Payment",
  robots: { index: false, follow: false },
};

export default function ProcessingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

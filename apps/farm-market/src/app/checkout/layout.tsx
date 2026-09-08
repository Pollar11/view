import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Delivery address, contact, and payment.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Subscription Boxes",
  description:
    "Pick an animal, enter your ZIP, and see the real monthly price — including delivery, calculated the same way as at checkout.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

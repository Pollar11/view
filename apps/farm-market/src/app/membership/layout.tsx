import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description: "Check your loyalty tier by the phone number you use at checkout.",
  alternates: { canonical: "/membership" },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}

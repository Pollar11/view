import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GATE_COOKIE, verifySession } from "@/lib/gate";
import { GateLogin } from "@/components/GateLogin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  const token = (await cookies()).get(GATE_COOKIE)?.value;
  if (await verifySession(token)) redirect("/");

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[var(--bg)]" />}>
      <GateLogin />
    </Suspense>
  );
}

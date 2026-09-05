import { NextResponse } from "next/server";
import { estimateDelivery } from "@/lib/delivery";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get("zip") ?? "";
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    return NextResponse.json(
      { error: "Provide a valid 5-digit ZIP code" },
      { status: 400 },
    );
  }
  return NextResponse.json(estimateDelivery(zip));
}

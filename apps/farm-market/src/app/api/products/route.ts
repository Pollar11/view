import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/products";
import { getAllStock } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  if (!rateLimit(req, "products-list", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const stock = getAllStock();
  const products = CATALOG.map((p) => ({ ...p, stock: stock[p.slug] ?? 0 }));
  return NextResponse.json({ products });
}

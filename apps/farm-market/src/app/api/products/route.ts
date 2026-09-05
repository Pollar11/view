import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/products";
import { getAllStock } from "@/lib/db";

export async function GET() {
  const stock = getAllStock();
  const products = CATALOG.map((p) => ({ ...p, stock: stock[p.slug] ?? 0 }));
  return NextResponse.json({ products });
}

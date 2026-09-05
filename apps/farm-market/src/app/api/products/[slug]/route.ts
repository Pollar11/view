import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { getStock } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const product = getProduct(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({
    product: { ...product, stock: getStock(product.slug) },
  });
}

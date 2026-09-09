import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { getStock } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  if (!rateLimit(req, "product-detail", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const product = getProduct(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({
    product: { ...product, stock: getStock(product.slug) },
  });
}

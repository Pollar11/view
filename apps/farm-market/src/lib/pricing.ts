import { CATALOG, getProduct } from "./products";
import type { CartLine, Category, OrderItem } from "./types";

export const FREE_DELIVERY_THRESHOLD = 75;
export const STANDARD_DELIVERY_FEE = 6.99;

export function lineUnitPrice(slug: string): number {
  const product = getProduct(slug);
  if (!product) return 0;
  return product.unitType === "per_lb"
    ? product.pricePerLb ?? 0
    : product.pricePerUnit ?? 0;
}

export function priceLine(line: CartLine): OrderItem | null {
  const product = getProduct(line.slug);
  if (!product) return null;
  const weight =
    product.unitType === "per_lb"
      ? line.weightLb ?? product.avgWeightLb ?? 1
      : null;
  const lineTotal =
    product.unitType === "per_lb"
      ? (product.pricePerLb ?? 0) * (weight ?? 0) * line.qty
      : (product.pricePerUnit ?? 0) * line.qty;

  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    unitLabel: line.unitLabel,
    qty: line.qty,
    weightLb: weight,
    lineTotal: Math.round(lineTotal * 100) / 100,
  };
}

/** Genuine multi-category "Farm Basket" discount — tiered by how many
 * distinct animal categories are in the cart. Not a fake/decorative badge:
 * it changes the real total computed below. */
export function bundleDiscountRate(categories: Set<Category>): number {
  if (categories.size >= 4) return 0.1;
  if (categories.size >= 2) return 0.05;
  return 0;
}

export interface CartTotals {
  items: OrderItem[];
  subtotal: number;
  bundleDiscountRate: number;
  bundleDiscountAmount: number;
  discountCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  freeDeliveryRemaining: number;
}

export interface AppliedCoupon {
  code: string;
  percentOff: number;
}

/**
 * Pure, isomorphic pricing math — safe to import from client components.
 * Coupon *validity* is always decided server-side (see /api/promo/validate
 * and the checkout route); this just applies a percentOff that has already
 * been confirmed valid, so the UI can preview totals without trusting an
 * unverified code itself.
 */
export function computeTotals(
  lines: CartLine[],
  appliedCoupon?: AppliedCoupon | null,
): CartTotals {
  const items = lines
    .map(priceLine)
    .filter((i): i is OrderItem => i !== null);

  const subtotal = round(items.reduce((sum, i) => sum + i.lineTotal, 0));
  const categories = new Set(items.map((i) => i.category));
  const rate = bundleDiscountRate(categories);
  const bundleDiscountAmount = round(subtotal * rate);

  let discountAmount = 0;
  let discountCode: string | null = null;
  const afterBundle = subtotal - bundleDiscountAmount;
  if (appliedCoupon) {
    discountCode = appliedCoupon.code;
    discountAmount = round(afterBundle * (appliedCoupon.percentOff / 100));
  }

  const afterAllDiscounts = afterBundle - discountAmount;
  const freeDeliveryRemaining = Math.max(
    0,
    round(FREE_DELIVERY_THRESHOLD - afterAllDiscounts),
  );
  const deliveryFee =
    items.length === 0
      ? 0
      : afterAllDiscounts >= FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;

  const total = round(afterAllDiscounts + deliveryFee);

  return {
    items,
    subtotal,
    bundleDiscountRate: rate,
    bundleDiscountAmount,
    discountCode,
    discountAmount,
    deliveryFee,
    total,
    freeDeliveryRemaining,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function catalogBySlug(slug: string) {
  return CATALOG.find((p) => p.slug === slug);
}

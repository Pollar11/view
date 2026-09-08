import { getProduct } from "./products";
import type { Category } from "./types";
import { estimateDelivery } from "./delivery";
import { STANDARD_DELIVERY_FEE } from "./pricing";

interface PlanDef {
  category: Category;
  slug: string;
  monthlyQty: number;
}

/** Monthly box = N packs/animals/units of a specific catalog product,
 * so the subscription price is always derived from real catalog pricing,
 * never a separately made-up number. */
const PLAN_DEFS: PlanDef[] = [
  { category: "sheep", slug: "lamb-rib-chops", monthlyQty: 3 },
  { category: "goat", slug: "goat-chops", monthlyQty: 3 },
  { category: "beef", slug: "beef-ribeye-steaks", monthlyQty: 3 },
  { category: "chicken", slug: "farm-chicken", monthlyQty: 3 },
  { category: "eggs", slug: "farm-eggs-dozen", monthlyQty: 4 },
  { category: "duck", slug: "farm-duck", monthlyQty: 2 },
  { category: "rabbit", slug: "rabbit-cuts", monthlyQty: 3 },
];

export interface SubscriptionPlan {
  category: Category;
  productName: string;
  monthlyQty: number;
  quantityLabel: string;
  basePrice: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = PLAN_DEFS.map((def) => {
  const product = getProduct(def.slug);
  if (!product) throw new Error(`Subscription plan references unknown product: ${def.slug}`);

  const basePrice =
    product.unitType === "per_lb"
      ? (product.pricePerLb ?? 0) * (product.avgWeightLb ?? 1) * def.monthlyQty
      : (product.pricePerUnit ?? 0) * def.monthlyQty;

  const quantityLabel =
    product.unitType === "per_lb"
      ? `${def.monthlyQty} pack${def.monthlyQty === 1 ? "" : "s"} of ${product.name.toLowerCase()} (~${(
          (product.avgWeightLb ?? 1) * def.monthlyQty
        ).toFixed(0)} lb)`
      : `${def.monthlyQty} ${product.unitNoun}${def.monthlyQty === 1 ? "" : "s"} of ${product.name.toLowerCase()}`;

  return {
    category: def.category,
    productName: product.name,
    monthlyQty: def.monthlyQty,
    quantityLabel,
    basePrice: Math.round(basePrice * 100) / 100,
  };
});

export function getSubscriptionPlan(category: Category): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.category === category);
}

export interface SubscriptionQuote {
  plan: SubscriptionPlan;
  zip: string;
  deliveryMiles: number;
  deliveryEtaDays: number;
  inServiceArea: boolean;
  monthlyDeliveryFee: number;
  monthlyTotal: number;
}

/**
 * Distance-based monthly quote: same ZIP-distance math used at checkout,
 * with delivery included free once the box itself clears $50 — otherwise
 * the standard per-delivery fee applies every month.
 */
export function quoteSubscription(category: Category, zip: string): SubscriptionQuote | null {
  const plan = getSubscriptionPlan(category);
  if (!plan) return null;

  const delivery = estimateDelivery(zip);
  const monthlyDeliveryFee = plan.basePrice >= 50 ? 0 : STANDARD_DELIVERY_FEE;

  return {
    plan,
    zip,
    deliveryMiles: delivery.milesEstimate,
    deliveryEtaDays: delivery.etaDays,
    inServiceArea: delivery.inServiceArea,
    monthlyDeliveryFee,
    monthlyTotal: Math.round((plan.basePrice + monthlyDeliveryFee) * 100) / 100,
  };
}

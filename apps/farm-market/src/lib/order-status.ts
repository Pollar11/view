import type { Order } from "./types";

export interface OrderStage {
  /** 0-indexed position in STAGE_LABELS. */
  index: number;
  label: string;
  estimatedDeliveryLabel: string;
}

export const STAGE_LABELS = ["Order confirmed", "Processing at the farm", "Out for delivery", "Delivered"] as const;

/**
 * There's no real fulfillment/logistics system behind this demo storefront,
 * so "tracking" is a deterministic function of time elapsed since the order
 * was placed versus its delivery ETA — the same honest approach as the
 * delivery-distance estimate (lib/delivery.ts): genuine math over real
 * data, clearly not a live GPS feed, and stable across repeated views
 * rather than randomized.
 */
export function computeOrderStage(order: Order): OrderStage {
  const placedAt = new Date(order.createdAt).getTime();
  const etaMs = order.deliveryEtaDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - placedAt;
  const ratio = etaMs > 0 ? elapsedMs / etaMs : 1;

  let index: number;
  if (ratio < 0.1) index = 0;
  else if (ratio < 0.6) index = 1;
  else if (ratio < 1) index = 2;
  else index = 3;

  const estimatedDelivery = new Date(placedAt + etaMs);
  const estimatedDeliveryLabel =
    index === 3
      ? `Delivered ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `Estimated delivery ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return { index, label: STAGE_LABELS[index]!, estimatedDeliveryLabel };
}

import type { Order, OrderStatus } from "./types";

export interface OrderStage {
  /** 0-indexed position in STAGE_LABELS. */
  index: number;
  label: string;
  estimatedDeliveryLabel: string;
  /** true once an admin has actually set this order's status in /admin —
   * false means index is only the time-elapsed estimate below. The UI
   * uses this to be honest about which kind of "status" it's showing. */
  isLive: boolean;
}

export const STAGE_LABELS = ["Order confirmed", "Processing at the farm", "Out for delivery", "Delivered"] as const;

const STATUS_INDEX: Record<OrderStatus, number> = {
  confirmed: 0,
  processing: 1,
  out_for_delivery: 2,
  delivered: 3,
};

/**
 * Prefers the real status an admin set from /admin (order.statusUpdatedAt
 * is only ever set by that action — see lib/db.ts updateOrderStatus). Most
 * orders in a small farm operation won't get a manual update for every
 * stage, so this falls back to the same honest, deterministic
 * time-elapsed-vs-ETA estimate as before for anything nobody has touched
 * yet — genuine math over real data, clearly not a live GPS feed, and
 * stable across repeated views rather than randomized.
 */
export function computeOrderStage(order: Order): OrderStage {
  const placedAt = new Date(order.createdAt).getTime();
  const etaMs = order.deliveryEtaDays * 24 * 60 * 60 * 1000;
  const estimatedDelivery = new Date(placedAt + etaMs);

  if (order.statusUpdatedAt) {
    const index = STATUS_INDEX[order.status];
    const estimatedDeliveryLabel =
      index === 3
        ? `Delivered ${new Date(order.statusUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : `Estimated delivery ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    return { index, label: STAGE_LABELS[index]!, estimatedDeliveryLabel, isLive: true };
  }

  const elapsedMs = Date.now() - placedAt;
  const ratio = etaMs > 0 ? elapsedMs / etaMs : 1;

  let index: number;
  if (ratio < 0.1) index = 0;
  else if (ratio < 0.6) index = 1;
  else if (ratio < 1) index = 2;
  else index = 3;

  const estimatedDeliveryLabel =
    index === 3
      ? `Delivered ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `Estimated delivery ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return { index, label: STAGE_LABELS[index]!, estimatedDeliveryLabel, isLive: false };
}

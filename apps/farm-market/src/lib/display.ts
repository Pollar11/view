import type { Product } from "./types";
import { money } from "./format";

export function priceLabel(p: Product): string {
  if (p.unitType === "per_unit") {
    return `${money(p.pricePerUnit ?? 0)} / ${p.unitNoun}`;
  }
  return `${money(p.pricePerLb ?? 0)} / ${p.unitNoun}`;
}

/** Numeric starting price, for structured data / analytics — same logic as
 * fromPriceLabel but returns a plain number instead of a formatted string. */
export function estimatedPrice(p: Product): number {
  if (p.unitType === "per_unit") return p.pricePerUnit ?? 0;
  if (p.portionOptions?.length) return (p.pricePerLb ?? 0) * p.portionOptions[0]!.weightLb;
  if (p.avgWeightLb) return (p.pricePerLb ?? 0) * p.avgWeightLb;
  return p.pricePerLb ?? 0;
}

export function fromPriceLabel(p: Product): string {
  if (p.unitType === "per_unit") {
    return `${money(p.pricePerUnit ?? 0)} each`;
  }
  if (p.portionOptions?.length) {
    const smallest = p.portionOptions[0]!;
    return `From ${money((p.pricePerLb ?? 0) * smallest.weightLb)} (${smallest.label})`;
  }
  if (p.avgWeightLb) {
    return `~${money((p.pricePerLb ?? 0) * p.avgWeightLb)} (${p.avgWeightLb} lb avg)`;
  }
  return priceLabel(p);
}

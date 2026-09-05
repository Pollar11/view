import type { Product } from "./types";
import { money } from "./format";

export function priceLabel(p: Product): string {
  if (p.unitType === "per_unit") {
    return `${money(p.pricePerUnit ?? 0)} / ${p.unitNoun}`;
  }
  return `${money(p.pricePerLb ?? 0)} / ${p.unitNoun}`;
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

export interface MembershipTier {
  name: string;
  minOrders: number;
  perk: string;
}

/** Ordered lowest to highest — findTier picks the highest tier the
 * customer's real order count qualifies for. */
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  { name: "Sprout", minOrders: 0, perk: "Welcome — your first order unlocks Pasture tier." },
  { name: "Pasture", minOrders: 1, perk: "Early access to seasonal items like duck and rabbit." },
  { name: "Homestead", minOrders: 3, perk: "Eligible for personal win-back discount codes by SMS." },
  { name: "Farmhand", minOrders: 6, perk: "Priority delivery scheduling — call to arrange your slot." },
];

export function findTier(totalOrders: number): MembershipTier {
  let current = MEMBERSHIP_TIERS[0]!;
  for (const tier of MEMBERSHIP_TIERS) {
    if (totalOrders >= tier.minOrders) current = tier;
  }
  return current;
}

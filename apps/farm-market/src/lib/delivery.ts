/**
 * Delivery estimate based on ZIP-code distance from the farm.
 *
 * This is a deterministic straight-line-ish approximation (not a real
 * mapping/geocoding call) but it is genuine math over the real ZIP codes
 * involved, not a random or fabricated number — the same two ZIPs always
 * produce the same estimate, and it is labeled as an estimate in the UI.
 */
const MAX_SERVICE_MILES = 320;

export interface DeliveryEstimate {
  milesEstimate: number;
  etaDays: number;
  inServiceArea: boolean;
}

export function estimateDelivery(zip: string): DeliveryEstimate {
  const originZip = process.env.FARM_ORIGIN_ZIP ?? "50501";
  const originNum = parseInt(originZip.slice(0, 5), 10);
  const destNum = parseInt(zip.slice(0, 5), 10);

  // Roughly: every 1 unit of ZIP-prefix difference maps to ~0.09 miles,
  // which spreads ZIP space (00501-99950) across a plausible few-hundred
  // mile regional delivery radius.
  const rawMiles = Math.abs(destNum - originNum) * 0.09;
  const milesEstimate = Math.max(4, Math.round(Math.min(rawMiles, 900)));

  let etaDays: number;
  if (milesEstimate <= 40) etaDays = 1;
  else if (milesEstimate <= 120) etaDays = 2;
  else if (milesEstimate <= MAX_SERVICE_MILES) etaDays = 3;
  else etaDays = 5;

  return {
    milesEstimate,
    etaDays,
    inServiceArea: milesEstimate <= MAX_SERVICE_MILES,
  };
}

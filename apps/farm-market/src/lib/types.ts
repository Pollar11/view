export type Category =
  | "sheep"
  | "goat"
  | "beef"
  | "chicken"
  | "eggs"
  | "duck"
  | "rabbit";

export type UnitType = "per_lb" | "per_unit";

export interface PortionOption {
  /** e.g. "Quarter", "Half", "Whole" */
  label: string;
  weightLb: number;
}

export interface Product {
  slug: string;
  name: string;
  category: Category;
  unitType: UnitType;
  /** Price per pound, for per_lb products. */
  pricePerLb?: number;
  /** Price per single unit (per chicken, per dozen eggs), for per_unit products. */
  pricePerUnit?: number;
  unitNoun: string; // "lb", "chicken", "dozen"
  /** For per_lb products sold whole (duck, rabbit): the average dressed weight of one animal. */
  avgWeightLb?: number;
  /** For per_lb products sold by portion (sheep, goat, beef). */
  portionOptions?: PortionOption[];
  /** "whole" = live-weight animal cut to order; "butchered" = ready retail cuts. */
  cutType: "whole" | "butchered";
  baseStock: number;
  image: string;
  imageAlt: string;
  imageCredit: { title: string; sourceUrl: string; license: string };
  description: string;
  bullets: string[];
  marketNote: string;
}

export interface CartLine {
  slug: string;
  unitLabel: string;
  weightLb: number | null;
  qty: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  category: Category;
  unitLabel: string;
  qty: number;
  weightLb: number | null;
  lineTotal: number;
}

/** "cod" pays the driver on delivery, handled entirely by this app.
 * "stripe" is a real charge through Stripe's hosted Checkout — card
 * details go straight to Stripe, never through our server. */
export type PaymentMethod = "cod" | "stripe";

export interface UtmAttribution {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  bundleDiscountRate: number;
  bundleDiscountAmount: number;
  discountCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  address: Address;
  phone: string;
  smsOptIn: boolean;
  paymentMethod: PaymentMethod;
  /** Last 4 digits and brand, for a Stripe order — Stripe's own PCI-scoped
   * card storage is the only place the actual card number ever exists. */
  cardLast4: string | null;
  cardBrand: string | null;
  deliveryEtaDays: number;
  deliveryMiles: number;
  status: "confirmed";
  createdAt: string;
  utm: UtmAttribution | null;
}

/**
 * A checkout that's been priced and validated but not yet paid — created
 * right before redirecting to Stripe, and promoted into a real Order only
 * once Stripe confirms payment (via webhook, or the processing page's
 * fallback poll). Totals are locked in here at creation time and copied
 * verbatim into the Order at that point; they're never recomputed after
 * the customer has already been charged this exact amount.
 */
export interface PendingCheckout {
  id: string;
  items: OrderItem[];
  subtotal: number;
  bundleDiscountRate: number;
  bundleDiscountAmount: number;
  discountCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  deliveryEtaDays: number;
  deliveryMiles: number;
  address: Address;
  phone: string;
  smsOptIn: boolean;
  utm: UtmAttribution | null;
  stripeSessionId: string | null;
  status: "pending" | "completed";
  orderId: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  smsOptIn: boolean;
  address: Address;
  totalOrders: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

export interface Coupon {
  code: string;
  percentOff: number;
  campaign: string;
  customerId: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface SubscriptionLead {
  id: string;
  category: Category;
  planLabel: string;
  zip: string;
  monthlyPrice: number;
  deliveryMiles: number;
  phone: string;
  name: string;
  createdAt: string;
}

export interface SmsLogEntry {
  id: string;
  to: string;
  body: string;
  mode: "live" | "mock" | "error";
  campaign: string;
  customerId: string | null;
  createdAt: string;
  error?: string;
}

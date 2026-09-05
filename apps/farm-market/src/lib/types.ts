export type Category = "sheep" | "goat" | "chicken" | "eggs" | "duck" | "rabbit";

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
  /** For per_lb products sold by portion (sheep, goat). */
  portionOptions?: PortionOption[];
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

export type PaymentMethod = "cod" | "card_demo";

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
  deliveryEtaDays: number;
  deliveryMiles: number;
  status: "confirmed";
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

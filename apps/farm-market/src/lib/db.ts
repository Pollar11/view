import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CATALOG } from "./products";
import type { Coupon, Customer, Order, PendingCheckout, SmsLogEntry, SubscriptionLead } from "./types";

/**
 * Vercel (and most serverless hosts) ship a read-only deployment bundle —
 * only /tmp is writable, and even that doesn't survive a cold start. We
 * still write there so a warm instance's admin dashboard reflects recent
 * orders, but the real source of truth for a running instance is the
 * in-memory `global.__farmMarketStore` below; a failed write must never
 * fail the request (see persist()).
 */
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "farm-market-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

interface StoreShape {
  customers: Customer[];
  orders: Order[];
  coupons: Coupon[];
  smsLog: SmsLogEntry[];
  subscriptionLeads: SubscriptionLead[];
  pendingCheckouts: PendingCheckout[];
  stock: Record<string, number>;
}

function emptyStore(): StoreShape {
  return {
    customers: [],
    orders: [],
    coupons: [],
    smsLog: [],
    subscriptionLeads: [],
    pendingCheckouts: [],
    stock: Object.fromEntries(CATALOG.map((p) => [p.slug, p.baseStock])),
  };
}

function load(): StoreShape {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    const base = emptyStore();
    return {
      customers: parsed.customers ?? base.customers,
      orders: parsed.orders ?? base.orders,
      coupons: parsed.coupons ?? base.coupons,
      smsLog: parsed.smsLog ?? base.smsLog,
      subscriptionLeads: parsed.subscriptionLeads ?? base.subscriptionLeads,
      pendingCheckouts: parsed.pendingCheckouts ?? base.pendingCheckouts,
      stock: { ...base.stock, ...(parsed.stock ?? {}) },
    };
  } catch {
    return emptyStore();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __farmMarketStore: StoreShape | undefined;
  // eslint-disable-next-line no-var
  var __farmMarketWriteChain: Promise<void> | undefined;
}

function getStore(): StoreShape {
  if (!global.__farmMarketStore) {
    global.__farmMarketStore = load();
  }
  return global.__farmMarketStore;
}

function persist(): Promise<void> {
  const snapshot = JSON.stringify(getStore(), null, 2);
  const prev = global.__farmMarketWriteChain ?? Promise.resolve();
  const next = prev
    .catch(() => undefined)
    .then(async () => {
      try {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
        await fs.promises.writeFile(DATA_FILE, snapshot, "utf-8");
      } catch (err) {
        // The in-memory store (already updated by the caller before persist()
        // runs) stays authoritative for this instance's lifetime — a disk
        // write failure must never fail the order/checkout/etc. request.
        console.error("[db] failed to persist store snapshot:", err);
      }
    });
  global.__farmMarketWriteChain = next;
  return next;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export function getStock(slug: string): number {
  const store = getStore();
  return store.stock[slug] ?? 0;
}

export function getAllStock(): Record<string, number> {
  return { ...getStore().stock };
}

export async function decrementStock(slug: string, qty: number): Promise<void> {
  const store = getStore();
  store.stock[slug] = Math.max(0, (store.stock[slug] ?? 0) - qty);
  await persist();
}

export function findCustomerByPhone(phone: string): Customer | undefined {
  return getStore().customers.find((c) => c.phone === phone);
}

export function listCustomers(): Customer[] {
  return [...getStore().customers].sort(
    (a, b) => +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt),
  );
}

export async function upsertCustomer(input: {
  phone: string;
  name: string;
  smsOptIn: boolean;
  address: Customer["address"];
  orderTotal: number;
}): Promise<Customer> {
  const store = getStore();
  const now = new Date().toISOString();
  const existing = store.customers.find((c) => c.phone === input.phone);
  if (existing) {
    existing.name = input.name;
    existing.smsOptIn = input.smsOptIn;
    existing.address = input.address;
    existing.totalOrders += 1;
    existing.totalSpent += input.orderTotal;
    existing.lastOrderAt = now;
    await persist();
    return existing;
  }
  const created: Customer = {
    id: newId("cust"),
    phone: input.phone,
    name: input.name,
    smsOptIn: input.smsOptIn,
    address: input.address,
    totalOrders: 1,
    totalSpent: input.orderTotal,
    firstOrderAt: now,
    lastOrderAt: now,
  };
  store.customers.push(created);
  await persist();
  return created;
}

export async function createOrder(order: Order): Promise<Order> {
  const store = getStore();
  store.orders.push(order);
  await persist();
  return order;
}

export function listOrders(): Order[] {
  return [...getStore().orders].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function getOrder(id: string): Order | undefined {
  return getStore().orders.find((o) => o.id === id);
}

export function getStats() {
  const store = getStore();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const ordersLast24h = store.orders.filter(
    (o) => now - +new Date(o.createdAt) <= dayMs,
  ).length;
  const ordersLast7d = store.orders.filter(
    (o) => now - +new Date(o.createdAt) <= dayMs * 7,
  ).length;
  return {
    ordersLast24h,
    ordersLast7d,
    totalOrders: store.orders.length,
    totalCustomers: store.customers.length,
  };
}

export async function createCoupon(input: {
  percentOff: number;
  campaign: string;
  customerId: string | null;
  ttlDays: number;
}): Promise<Coupon> {
  const store = getStore();
  const prefix = input.campaign
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const code = `${prefix}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const coupon: Coupon = {
    code,
    percentOff: input.percentOff,
    campaign: input.campaign,
    customerId: input.customerId,
    expiresAt: new Date(Date.now() + input.ttlDays * 86400000).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  };
  store.coupons.push(coupon);
  await persist();
  return coupon;
}

export function findValidCoupon(code: string): Coupon | undefined {
  const store = getStore();
  const normalized = code.trim().toUpperCase();
  return store.coupons.find(
    (c) =>
      c.code === normalized &&
      !c.usedAt &&
      +new Date(c.expiresAt) > Date.now(),
  );
}

export async function markCouponUsed(code: string): Promise<void> {
  const store = getStore();
  const coupon = store.coupons.find((c) => c.code === code.trim().toUpperCase());
  if (coupon) {
    coupon.usedAt = new Date().toISOString();
    await persist();
  }
}

export async function createSubscriptionLead(
  input: Omit<SubscriptionLead, "id" | "createdAt">,
): Promise<SubscriptionLead> {
  const store = getStore();
  const lead: SubscriptionLead = {
    ...input,
    id: newId("sub"),
    createdAt: new Date().toISOString(),
  };
  store.subscriptionLeads.push(lead);
  await persist();
  return lead;
}

export function listSubscriptionLeads(): SubscriptionLead[] {
  return [...getStore().subscriptionLeads].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function logSms(entry: Omit<SmsLogEntry, "id" | "createdAt">) {
  const store = getStore();
  const full: SmsLogEntry = {
    ...entry,
    id: newId("sms"),
    createdAt: new Date().toISOString(),
  };
  store.smsLog.push(full);
  await persist();
  return full;
}

export function listSmsLog(): SmsLogEntry[] {
  return [...getStore().smsLog].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function createPendingCheckout(
  input: Omit<PendingCheckout, "id" | "status" | "orderId" | "createdAt">,
): Promise<PendingCheckout> {
  const store = getStore();
  const pending: PendingCheckout = {
    ...input,
    id: newId("pending"),
    status: "pending",
    orderId: null,
    createdAt: new Date().toISOString(),
  };
  store.pendingCheckouts.push(pending);
  await persist();
  return pending;
}

export function getPendingCheckout(id: string): PendingCheckout | undefined {
  return getStore().pendingCheckouts.find((p) => p.id === id);
}

/**
 * Synchronously flips a pending checkout to "completed" the first time
 * it's called, returning false for every call after — guards against the
 * webhook and the processing page's fallback poll both trying to finalize
 * the same payment at nearly the same instant *within one warm instance*
 * (no `await` between the check and the set, so no interleaving is
 * possible there). It can't guard across separate serverless instances,
 * which don't share this in-memory store; that's the same underlying
 * limitation as everywhere else in this file, and would need a real
 * database (with a real transaction) to close completely.
 */
export function claimPendingCheckout(id: string): boolean {
  const pending = getStore().pendingCheckouts.find((p) => p.id === id);
  if (!pending || pending.status !== "pending") return false;
  pending.status = "completed";
  return true;
}

export async function attachStripeSessionId(id: string, sessionId: string): Promise<void> {
  const pending = getPendingCheckout(id);
  if (pending) {
    pending.stripeSessionId = sessionId;
    await persist();
  }
}

export async function completePendingCheckout(id: string, orderId: string): Promise<void> {
  const pending = getPendingCheckout(id);
  if (pending) {
    pending.status = "completed";
    pending.orderId = orderId;
    await persist();
  }
}

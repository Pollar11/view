import { config } from "./config";

/**
 * Editable-at-runtime overrides on top of env config, managed by /admin.
 * Storage is pluggable: in-memory by default (fine for a single long-lived
 * Node process / local dev), Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN
 * are set (survives serverless, shared across instances).
 */
export type SectionOverride = {
  hidden?: boolean;
  order?: number;
  title?: string;
  layout?: "rail" | "grid";
};

export type Overrides = {
  sportOrder?: string[];
  sections?: Record<string, SectionOverride>;
  featuredVideoId?: string;
  featuredLiveId?: string;
  updatedAt?: number;
};

const EMPTY: Overrides = {};

interface OverrideStore {
  get(): Promise<Overrides>;
  set(next: Overrides): Promise<void>;
}

class MemoryStore implements OverrideStore {
  private data: Overrides = EMPTY;
  async get() {
    return this.data;
  }
  async set(next: Overrides) {
    this.data = next;
  }
}

/** Upstash/Vercel-KV REST API — no SDK dependency. */
class KvStore implements OverrideStore {
  private key = "view:overrides";
  constructor(
    private url: string,
    private token: string,
  ) {}
  private async cmd(command: (string | number)[]): Promise<unknown> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KV ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return json.result;
  }
  async get(): Promise<Overrides> {
    try {
      const raw = (await this.cmd(["GET", this.key])) as string | null;
      return raw ? (JSON.parse(raw) as Overrides) : EMPTY;
    } catch {
      return EMPTY;
    }
  }
  async set(next: Overrides): Promise<void> {
    await this.cmd(["SET", this.key, JSON.stringify(next)]);
  }
}

let store: OverrideStore | null = null;
function getStore(): OverrideStore {
  if (store) return store;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  store = url && token ? new KvStore(url, token) : new MemoryStore();
  return store;
}

// short-lived cache so page renders don't each hit KV
let cache: { at: number; value: Overrides } | null = null;

export async function getOverrides(): Promise<Overrides> {
  if (cache && Date.now() - cache.at < 5000) return cache.value;
  const value = await getStore().get();
  cache = { at: Date.now(), value };
  return value;
}

export async function saveOverrides(next: Overrides): Promise<void> {
  const clean: Overrides = { ...next, updatedAt: Date.now() };
  await getStore().set(clean);
  cache = { at: Date.now(), value: clean };
}

export async function getSportOrder(): Promise<string[]> {
  const o = await getOverrides();
  return o.sportOrder?.length ? o.sportOrder : config.sportOrder;
}

export function storeKind(): "kv" | "memory" {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? "kv"
    : "memory";
}

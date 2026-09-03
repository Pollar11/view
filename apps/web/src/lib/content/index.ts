import { config } from "@/lib/config";
import type { ContentProvider } from "@/lib/types";
import { CachedProvider } from "./cached";
import { OverlayProvider } from "./overlay";
import { MockProvider } from "./mock";
import { RestProvider } from "./rest";
import { RssProvider } from "./rss";

let instance: ContentProvider | null = null;
let base: ContentProvider | null = null;

function build() {
  let raw: ContentProvider;
  switch (config.provider) {
    case "rest":
      raw = new RestProvider();
      break;
    case "rss":
      raw = new RssProvider();
      break;
    default:
      raw = new MockProvider();
  }
  base = new CachedProvider(raw); // upstream -> micro-cache
  instance = new OverlayProvider(base); // -> admin overrides
}

/** The provider used everywhere in the app (overrides applied). */
export function getProvider(): ContentProvider {
  if (!instance) build();
  return instance!;
}

/** The provider without /admin overrides — for the admin UI itself. */
export function getBaseProvider(): ContentProvider {
  if (!base) build();
  return base!;
}

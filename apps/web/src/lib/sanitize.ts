import sanitizeHtml from "sanitize-html";

/**
 * Ad / tracker hosts that must never be embedded, even if upstream
 * content tries to inject them via <iframe>/<script>/<img> beacons.
 * Not exhaustive — it is a defense-in-depth layer on top of "we never
 * add ad SDKs ourselves". Extend freely.
 */
const BLOCKED_HOST_PATTERNS: RegExp[] = [
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)googlesyndication\.com$/i,
  /(^|\.)googleadservices\.com$/i,
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)googletagservices\.com$/i,
  /(^|\.)adservice\.google\./i,
  /(^|\.)amazon-adsystem\.com$/i,
  /(^|\.)adnxs\.com$/i,
  /(^|\.)adsrvr\.org$/i,
  /(^|\.)rubiconproject\.com$/i,
  /(^|\.)pubmatic\.com$/i,
  /(^|\.)criteo\.(com|net)$/i,
  /(^|\.)taboola\.com$/i,
  /(^|\.)outbrain\.com$/i,
  /(^|\.)scorecardresearch\.com$/i,
  /(^|\.)moatads\.com$/i,
  /(^|\.)adform\.net$/i,
  /(^|\.)facebook\.(com|net)$/i,
  /(^|\.)fbcdn\.net$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)segment\.(com|io)$/i,
  /(^|\.)branch\.io$/i,
  /(^|\.)mixpanel\.com$/i,
  /(^|\.)ads\./i,
];

export function isBlockedUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw, "https://placeholder.local");
    if (u.protocol !== "https:" && u.protocol !== "http:") return true;
    return BLOCKED_HOST_PATTERNS.some((re) => re.test(u.hostname));
  } catch {
    return true;
  }
}

/** Allow-list of iframe hosts we permit for legit video embeds. */
const IFRAME_ALLOWED_HOSTS = [
  "player.vimeo.com",
  "www.youtube-nocookie.com",
  "iframe.mediadelivery.net",
  "player.cloudflare.com",
  "customer-*.cloudflarestream.com",
];

function hostAllowedForIframe(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return IFRAME_ALLOWED_HOSTS.some((pat) => {
      if (pat.includes("*")) {
        const re = new RegExp(
          "^" + pat.replace(/[.]/g, "\\.").replace(/\*/g, "[^.]+") + "$",
          "i",
        );
        return re.test(hostname);
      }
      return hostname.toLowerCase() === pat;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize an upstream description / rich-text blob:
 *  - strips <script>, <style>, event handlers, and ad/tracker hosts
 *  - keeps a small set of formatting tags + safe video iframes
 */
export function cleanRichText(dirty: string | undefined | null): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "blockquote",
      "ul", "ol", "li", "a", "h2", "h3", "h4", "pre", "code", "hr",
      "figure", "figcaption", "img", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "title"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener nofollow noreferrer ugc",
          target: "_blank",
        },
      }),
    },
    exclusiveFilter: (frame) => {
      const src = frame.attribs?.src;
      if ((frame.tag === "img" || frame.tag === "iframe") && isBlockedUrl(src)) {
        return true; // drop
      }
      if (frame.tag === "iframe" && (!src || !hostAllowedForIframe(src))) {
        return true;
      }
      if (frame.tag === "a" && isBlockedUrl(frame.attribs?.href)) {
        return true;
      }
      return false;
    },
  }).trim();
}

/** Sanitize a plain string field down to text only. */
export function cleanText(dirty: string | undefined | null): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim();
}

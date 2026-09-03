import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';

/**
 * Scrubs upstream text so nothing identifying about a source website can reach
 * the database, the API responses, the frontend, or an AI prompt.
 *
 * Removed:
 *   - all HTML markup
 *   - URLs (http/https, protocol-relative, bare `domain.tld/...`)
 *   - email addresses and @handles
 *   - configured brand terms + source hostnames (word-boundary, case-insensitive)
 *   - common scraper boilerplate ("Read more at ...", "Source:", "Courtesy of ...")
 *   - control chars / zero-width chars, collapsed whitespace
 */
@Injectable()
export class TextSanitizer {
  private readonly brandPatterns: RegExp[];

  constructor(config: ConfigService) {
    const terms: string[] = config.get('scrubTerms') ?? [];
    this.brandPatterns = terms
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
      .map((t) => new RegExp(`\\b${escapeRegExp(t)}\\b`, 'gi'));
  }

  /** Plain-text field (title, genre, tag). */
  text(input: string | null | undefined): string {
    if (!input) return '';
    let s = stripHtml(input);
    s = this.scrub(s);
    return normaliseWhitespace(s);
  }

  /** Longer description field — same rules, keeps sentence breaks. */
  description(input: string | null | undefined): string {
    if (!input) return '';
    let s = stripHtml(input);
    s = this.scrub(s);
    s = s
      .split(/\n{2,}/)
      .map((p) => normaliseWhitespace(p))
      .filter(Boolean)
      .join('\n\n');
    return s.trim();
  }

  list(input: (string | null | undefined)[] | null | undefined): string[] {
    if (!input) return [];
    const out = new Set<string>();
    for (const raw of input) {
      const v = this.text(raw);
      if (v && v.length <= 60) out.add(v);
    }
    return [...out];
  }

  /**
   * Prepares an arbitrary object for an AI prompt: recursively sanitises every
   * string value and drops any key that looks like it could carry a link.
   */
  forPrompt<T>(value: T): T {
    return deepScrub(value, (s) => this.text(s)) as T;
  }

  private scrub(s: string): string {
    let out = s;
    out = out.replace(URL_RE, ' ');
    out = out.replace(BARE_DOMAIN_RE, ' ');
    out = out.replace(EMAIL_RE, ' ');
    out = out.replace(HANDLE_RE, ' ');
    out = out.replace(BOILERPLATE_RE, ' ');
    for (const re of this.brandPatterns) out = out.replace(re, ' ');
    return out;
  }
}

/* ----------------------------- helpers ----------------------------- */

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>()"']+/gi;
// protocol-relative and bare "example.com/path" — TLD list kept broad but finite
const BARE_DOMAIN_RE =
  /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|tv|co|uk|de|fr|es|it|ru|info|biz|app|stream|watch|live|media|xyz|online|site|to|cc|me|us|ca|au|in)\b(?:\/[^\s<>()"']*)?/gi;
const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const HANDLE_RE = /(^|\s)@[a-z0-9_]{2,}/gi;
const BOILERPLATE_RE =
  /\b(?:read (?:more|the full (?:article|story)) (?:at|on)|full (?:story|article) (?:at|on)|source|sources|courtesy of|via|originally (?:published|posted) (?:at|on|by)|photo(?:graph)? by|image (?:credit|via)|all rights reserved|subscribe (?:now|today)|click here)\b[:\-\s]*/gi;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(input: string): string {
  if (!/[<&]/.test(input)) return input;
  try {
    const $ = cheerio.load(`<div id="__root">${input}</div>`);
    $('#__root script, #__root style, #__root noscript').remove();
    return $('#__root').text();
  } catch {
    return input.replace(/<[^>]*>/g, ' ');
  }
}

function normaliseWhitespace(s: string): string {
  return s
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function deepScrub(value: unknown, scrub: (s: string) => string): unknown {
  if (typeof value === 'string') return scrub(value);
  if (Array.isArray(value)) return value.map((v) => deepScrub(v, scrub));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (/url|link|href|src|source|domain|host|site/i.test(k)) continue;
      out[k] = deepScrub(v, scrub);
    }
    return out;
  }
  return value;
}

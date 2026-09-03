const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy — the enforcement half of "ad-free".
 * View ships no ad SDKs; this policy makes it impossible for upstream
 * content or a compromised dependency to load one at runtime.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https:",
  "font-src 'self' data:",
  "frame-src 'self' https://player.vimeo.com https://www.youtube-nocookie.com https://iframe.mediadelivery.net https://player.cloudflare.com https://*.cloudflarestream.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Allow remote thumbnails/posters from any host by default.
    // Tighten this to your own CDN hostnames for production.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "browsing-topics=(), interest-cohort=(), join-ad-interest-group=(), run-ad-auction=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

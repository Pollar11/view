/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS for a year, including subdomains, once served over HTTPS once.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https://commons.wikimedia.org https://upload.wikimedia.org",
              "style-src 'self' 'unsafe-inline'",
              // 'unsafe-eval' is required only by Next.js's dev-mode webpack bundle
              // (HMR/React Refresh use eval-based sourcemaps) — never needed in a
              // production build, so it's dropped there to keep the real CSP strict.
              `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${
                process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""
              }`,
              "connect-src 'self' https://vitals.vercel-insights.com",
              "frame-src 'self' https://www.openstreetmap.org",
              "font-src 'self' data:",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // Admin dashboard and order confirmations should never be indexed —
        // enforced here at the header level (not just page metadata) so it
        // holds regardless of how the route renders, and isn't dependent on
        // robots.txt listing the path at all.
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/order/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/checkout/processing",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

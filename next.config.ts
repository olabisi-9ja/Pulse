import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Inline scripts stay allowed for Next's bootstrap and the pre-paint theme script;
// a nonce-based CSP via the proxy is the stricter next step.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${dev ? " ws:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The wallet scans QR codes, so the camera is allowed for this origin only.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@payvault/protocol", "@payvault/countries"],
  // Lets a second origin act as another phone during local two-device testing.
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The browser must always revalidate the service worker so updates reach installed apps.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, max-age=0" }] },
    ];
  },
};

export default nextConfig;

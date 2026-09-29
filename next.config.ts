import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@payvault/protocol", "@payvault/countries"],
  // Lets a second origin act as another phone during local two-device testing.
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    // The browser must always revalidate the service worker so updates reach installed apps.
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, max-age=0" }] }];
  },
};

export default nextConfig;

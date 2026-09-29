import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@payvault/protocol", "@payvault/countries"],
  // Lets a second origin act as another phone during local two-device testing.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

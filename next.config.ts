import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@payvault/protocol", "@payvault/countries"],
};

export default nextConfig;

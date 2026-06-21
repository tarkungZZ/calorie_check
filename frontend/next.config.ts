import type { NextConfig } from "next";

const isMobile = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  output: isMobile ? "export" : "standalone",
  images: isMobile ? { unoptimized: true } : undefined,
};

export default nextConfig;

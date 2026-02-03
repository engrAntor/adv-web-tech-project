import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

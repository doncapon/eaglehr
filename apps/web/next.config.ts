import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@eaglehr/ui", "@eaglehr/types"],
  eslint: {
    // Linted separately via `turbo run lint`.
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  experimental: {
    // Without this, dev-mode compiles pull in the entire barrel export of
    // these packages (1000+ icon modules for lucide-react) on every route
    // that imports even a single icon, instead of just what's used.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;

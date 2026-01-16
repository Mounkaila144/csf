import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    // Désactiver temporairement les vérifications TypeScript pour le build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Garder ESLint mais autoriser les warnings
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  // OPTIMISATION: Mode standalone pour réduire la taille du bundle
  output: 'standalone',
};

export default nextConfig;

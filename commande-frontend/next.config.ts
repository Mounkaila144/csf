import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    // SÉCURITÉ: Activer les vérifications TypeScript pour détecter les erreurs
    ignoreBuildErrors: false,
  },
  eslint: {
    // SÉCURITÉ: Activer ESLint pour détecter les problèmes de code
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

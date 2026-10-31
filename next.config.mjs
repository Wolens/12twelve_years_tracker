import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Меньше «битого» webpack-кэша после частых правок на Windows.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();

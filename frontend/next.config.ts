import type { NextConfig } from "next";

// Demo mode = static data, no backend. Enabled explicitly via env, or
// automatically on Vercel (which sets VERCEL=1 at build time). Docker/local
// builds have no VERCEL var, so they keep talking to the real backend.
const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE || (process.env.VERCEL ? "true" : "");

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_DEMO_MODE: DEMO_MODE,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "minio" },
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;

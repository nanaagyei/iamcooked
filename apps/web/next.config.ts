import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "www.google.com" },
    ],
  },
  transpilePackages: [
    "@iamcooked/ui",
    "@iamcooked/db",
    "@iamcooked/ai",
    "@iamcooked/scanner",
    "@iamcooked/sources",
    "@iamcooked/validators",
  ],
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
      },
      {
        source: "/icon",
        destination: "/icon.svg",
      },
    ];
  },
};

export default nextConfig;

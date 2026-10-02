import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "wyxzrhpbsptpeyhjlvie.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      // Admin uploads allow images up to 3MB; leave room for multipart overhead.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;

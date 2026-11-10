import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./lib/images/hosts";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  experimental: {
    serverActions: {
      // Admin uploads allow images up to 3MB; leave room for multipart overhead.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;

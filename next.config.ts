import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Receipt uploads are phone screenshots; the 1MB default rejects them.
      // Capped at 5MB in the action itself, with room here for multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;

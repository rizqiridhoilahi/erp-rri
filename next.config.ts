import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.erp.pt-rri.com',
      },
    ],
  },
};

export default nextConfig;

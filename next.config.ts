import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'https://leoned.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;

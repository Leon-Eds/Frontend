import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
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

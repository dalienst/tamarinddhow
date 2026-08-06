import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Remove the empty turbopack object (not needed)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Optional: be more specific if you want (recommended for security)
        // pathname: "/**",   // allows all paths under the domain
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
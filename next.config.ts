import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-20c7b6320e7f405891cc64f60c0a94f9.r2.dev",
      },
      {
        protocol: "https",
        hostname: "145bfd4c7fefef3c257dd80d71ec9647.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;

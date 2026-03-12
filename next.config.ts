import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1200],
    imageSizes: [280, 400, 800],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.notionusercontent.com",
        pathname: "/secure.notion-static.com/**",
      },
      {
        protocol: "https",
        hostname: "www.notion.so",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1200],
    imageSizes: [280, 400, 800],
    qualities: [75, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.notionusercontent.com",
        pathname: "/**",
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
      },
    ],
  },
  async headers() {
    return [
      {
        // giscus는 테마 CSS를 crossorigin="anonymous"로 불러간다.
        // giscus.app 오리진의 iframe이 받아가는 것이라 CORS 헤더가 없으면 무시된다.
        source: "/giscus/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;

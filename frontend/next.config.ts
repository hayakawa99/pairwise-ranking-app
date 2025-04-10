import type { NextConfig } from "next";
import { NextConfig as NextConfigWithRewrites } from "next";

const nextConfig: NextConfigWithRewrites = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:8000/api/:path*", // コンテナ名ベースのURL
      },
    ];
  },
};

export default nextConfig;

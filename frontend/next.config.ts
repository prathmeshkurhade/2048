import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from FastAPI in development
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;

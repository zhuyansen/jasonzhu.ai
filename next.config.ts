import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./src/content/blog/**/*"],
  },
};

export default nextConfig;

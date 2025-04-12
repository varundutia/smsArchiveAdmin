import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  distDir: 'build' // Changes `.next/` to `build/`
};

export default nextConfig;



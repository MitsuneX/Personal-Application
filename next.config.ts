import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Tauri v2 compatibility + Vercel static hosting
  output: "export",

  // Required for static export (disables Next.js Image Optimization server)
  images: {
    unoptimized: true,
  },

  // Trailing slashes for file-system compatibility in Tauri
  trailingSlash: true,

  // Expose env vars to client
  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
    NEXT_PUBLIC_APP_NAME: "Dashboard",
  },
};

export default nextConfig;

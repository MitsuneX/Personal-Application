import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Restart trigger to load newly generated prisma client

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

  // ── PWA & Digital Asset Links Headers ─────────────────────────────────────
  async headers() {
    return [
      {
        // Digital Asset Links — must serve as application/json for Android verification
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // PWA Manifest — CORS open so Bubblewrap and browsers can read it
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // Service Worker — must be served from root scope
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;

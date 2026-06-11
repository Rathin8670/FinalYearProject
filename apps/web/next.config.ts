import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@carepulse/ai-chat-widget"],

  // Prevent Turbopack from bundling native canvas binary
  serverExternalPackages: ["@napi-rs/canvas"],
};

export default nextConfig;
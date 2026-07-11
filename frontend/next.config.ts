import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js dev server blocks cross-origin requests to dev assets by default.
  // Testing on a phone over LAN needs the dev machine's LAN IP allow-listed,
  // otherwise the client JS bundle fails to load and hydration never runs —
  // links still work (plain SSR'd anchors) but every onClick-driven button
  // (hamburger, search, cart) stays inert.
  allowedDevOrigins: ["192.168.0.129"],
};

export default nextConfig;

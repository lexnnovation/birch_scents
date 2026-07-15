import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker runtime image copies only .next/standalone (CLAUDE.md §13).
  output: "standalone",
  // Next.js dev server blocks cross-origin requests to dev assets by default.
  // Testing on a phone over LAN needs the dev machine's LAN IP allow-listed,
  // otherwise the client JS bundle fails to load and hydration never runs —
  // links still work (plain SSR'd anchors) but every onClick-driven button
  // (hamburger, search, cart) stays inert. Both of the dev machine's regular
  // LAN IPs are listed so switching networks doesn't silently reintroduce
  // this — add a third here if another one shows up.
  allowedDevOrigins: ["192.168.0.129", "192.168.0.171"],
};

export default nextConfig;

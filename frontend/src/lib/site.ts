/** Single source of truth for the site's canonical origin — used by metadataBase, robots.ts, and sitemap.ts. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

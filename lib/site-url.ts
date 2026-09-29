/** Public origin for absolute URLs (sitemap, robots, social images). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://payvault-phi.vercel.app").replace(/\/$/, "");

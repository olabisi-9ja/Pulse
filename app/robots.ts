import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    // The wallet, console and sign-in are signed-in surfaces; the API is not for crawlers.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/app", "/*/console", "/*/sign-in"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

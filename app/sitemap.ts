import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { PAGE_SLUGS } from "@/messages/docs";

const SITE = ["", "product", "how-it-works", "pay-later", "use-cases", "coverage", "developers", "pricing", "security", "about", "contact", "privacy", "terms"];
const DOCS = Object.values(PAGE_SLUGS).map((s) => (s ? `docs/${s}` : "docs"));

export default function sitemap(): MetadataRoute.Sitemap {
  return [...SITE, ...DOCS].flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path ? `/${path}` : ""}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("docs") ? 0.5 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path ? `/${path}` : ""}`])) },
    })),
  );
}

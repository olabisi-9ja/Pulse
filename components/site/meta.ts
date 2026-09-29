import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { getSiteMessages, type SiteMessages } from "@/messages/site";

/** Localized title, description and language alternates for a marketing page. */
export async function siteMetadata(
  params: Promise<{ locale: string }>,
  key: keyof SiteMessages["meta"],
  slug = "",
): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getSiteMessages(locale).meta[key];
  const path = slug ? `/${slug}` : "";
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: { title: `${m.title} · PayVault`, description: m.description, locale, type: "website" },
  };
}

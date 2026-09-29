import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { getDocsMessages, PAGE_SLUGS, type PageKey } from "@/messages/docs";

/** Validates the locale segment and returns it with the docs catalog. */
export async function docsPage(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale: locale as Locale, t: getDocsMessages(locale) };
}

export async function docsMetadata(params: Promise<{ locale: string }>, key: PageKey): Promise<Metadata> {
  const { locale, t } = await docsPage(params);
  const m = t.pages[key];
  const path = PAGE_SLUGS[key] ? `/docs/${PAGE_SLUGS[key]}` : "/docs";
  return {
    title: `${m.title} · Docs`,
    description: m.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
  };
}

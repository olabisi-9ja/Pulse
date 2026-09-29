import { notFound } from "next/navigation";
import { LegalPage, legalMetadata } from "@/components/site/LegalPage";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  return legalMetadata(params, "privacy");
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="privacy" />;
}

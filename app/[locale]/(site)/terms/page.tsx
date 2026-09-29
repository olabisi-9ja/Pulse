import { notFound } from "next/navigation";
import { LegalPage, legalMetadata } from "@/components/site/LegalPage";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">) {
  return legalMetadata(params, "terms");
}

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="terms" />;
}

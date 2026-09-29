import { notFound } from "next/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  return (
    <>
      <Header locale={locale} t={t.nav} />
      <main id="main">{children}</main>
      <Footer locale={locale} t={t} />
    </>
  );
}

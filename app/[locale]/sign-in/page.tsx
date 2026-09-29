import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/wallet/I18n";
import { SignIn } from "@/components/wallet/SignIn";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({ params, searchParams }: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const next = (await searchParams).next;
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : `/${locale}/app`;
  return (
    <I18nProvider locale={locale}>
      <div className="pv-wallet min-h-dvh">
        <SignIn next={target} />
      </div>
    </I18nProvider>
  );
}

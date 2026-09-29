import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/wallet/I18n";
import { WalletApp } from "@/components/wallet/WalletApp";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Wallet",
  robots: { index: false },
};

// Matches the wallet canvas so the installed app's status bar blends in.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default async function AppPage({ params }: PageProps<"/[locale]/app">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <I18nProvider locale={locale}>
      <div className="pv-wallet">
        <WalletApp />
      </div>
    </I18nProvider>
  );
}

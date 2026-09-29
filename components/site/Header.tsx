"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/lib/i18n";
import type { SiteMessages } from "@/messages/site";

// Four links only; pay later, use cases and coverage live in the footer.
const NAV = [
  ["product", "product"],
  ["howItWorks", "how-it-works"],
  ["developers", "developers"],
  ["pricing", "pricing"],
] as const;

function LocaleSwitch({ locale, label, text }: { locale: Locale; label: string; text: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const other: Locale = locale === "en" ? "fr" : "en";
  const rest = pathname.split("/").slice(2).join("/");
  const href = `/${other}${rest ? `/${rest}` : ""}`;
  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={label}
      onClick={() => {
        try {
          document.cookie = `pv_locale=${other}; path=/; max-age=31536000; samesite=lax`;
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3.5 text-sm font-medium text-ink hover:bg-card"
    >
      <Globe className="h-4 w-4" aria-hidden />
      {text}
    </Link>
  );
}

export function Header({ locale, t }: { locale: Locale; t: SiteMessages["nav"] }) {
  const pathname = usePathname() ?? "";
  const links = NAV.map(([key, slug]) => ({ label: t[key], href: `/${locale}/${slug}` }));
  const isActive = (href: string) => pathname === href;

  const navLink = (l: { label: string; href: string }) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={isActive(l.href) ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive(l.href) ? "bg-green text-on-accent" : "text-ink hover:bg-card-2"
      }`}
    >
      {l.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t.skip}
      </a>
      <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="shrink-0" aria-label="PayVault">
          <Logo />
        </Link>

        {/* Wide screens: the whole nav inline in one pill */}
        <nav aria-label={t.primary} className="hidden items-center gap-0.5 rounded-full border border-line bg-card p-1 md:flex">
          {links.map(navLink)}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} label={t.switchLabel} text={t.switchTo} />
          <Link
            href={`/${locale}/contact`}
            className="hidden min-h-10 items-center whitespace-nowrap rounded-full bg-green px-5 text-sm font-medium text-on-accent hover:bg-green-strong sm:inline-flex"
          >
            {t.pilot}
          </Link>
        </div>
      </div>

      {/* Narrower screens: the same links as a swipeable row, never a hamburger */}
      <nav aria-label={t.primary} className="border-t border-line md:hidden">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
          {links.map(navLink)}
        </div>
      </nav>
    </header>
  );
}

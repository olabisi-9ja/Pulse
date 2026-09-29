"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/lib/i18n";
import type { SiteMessages } from "@/messages/site";

const NAV = [
  ["product", "product"],
  ["howItWorks", "how-it-works"],
  ["payLater", "pay-later"],
  ["useCases", "use-cases"],
  ["coverage", "coverage"],
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
      className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-card px-3.5 text-sm font-semibold text-navy hover:bg-card-2"
    >
      <Globe className="h-4 w-4" aria-hidden />
      {text}
    </Link>
  );
}

export function Header({ locale, t }: { locale: Locale; t: SiteMessages["nav"] }) {
  const pathname = usePathname() ?? "";
  // The menu is open only for the page it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pathname]);

  const links = NAV.map(([key, slug]) => ({ label: t[key], href: `/${locale}/${slug}` }));
  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t.skip}
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="shrink-0" aria-label="PayVault">
          <Logo />
        </Link>

        <nav aria-label={t.primary} className="hidden items-center gap-1 2xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-card ${
                isActive(l.href) ? "bg-green-soft text-green" : "text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 2xl:flex">
          <LocaleSwitch locale={locale} label={t.switchLabel} text={t.switchTo} />
          <Link
            href={`/${locale}/app`}
            className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-line bg-card px-4 text-sm font-bold text-navy hover:bg-card-2"
          >
            {t.openApp}
          </Link>
          <Link
            href={`/${locale}/console`}
            className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-green px-4 text-sm font-bold text-on-accent hover:bg-green-strong"
          >
            {t.console}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-navy 2xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.closeMenu : t.menu}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper 2xl:hidden">
          <nav aria-label={t.primary} className="mx-auto flex max-w-6xl flex-col px-4 py-4 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-2xl px-4 py-3.5 text-base font-semibold ${
                  isActive(l.href) ? "bg-green-soft text-green" : "text-ink hover:bg-card"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 grid gap-3 border-t border-line pt-4">
              <Link
                href={`/${locale}/console`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-green px-5 text-sm font-bold text-on-accent"
              >
                {t.console}
              </Link>
              <Link
                href={`/${locale}/app`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card px-5 text-sm font-bold text-navy"
              >
                {t.openApp}
              </Link>
              <div className="flex justify-center pt-1">
                <LocaleSwitch locale={locale} label={t.switchLabel} text={t.switchTo} />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

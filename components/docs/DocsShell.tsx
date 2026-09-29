"use client";

import { ChevronLeft, ChevronRight, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/lib/i18n";

export type NavGroup = { label: string; items: { title: string; href: string }[] };

type Labels = {
  docs: string;
  skip: string;
  menu: string;
  closeMenu: string;
  navLabel: string;
  switchTo: string;
  switchLabel: string;
  prev: string;
  next: string;
};

function LocaleSwitch({ locale, labels }: { locale: Locale; labels: Labels }) {
  const pathname = usePathname() ?? `/${locale}/docs`;
  const other: Locale = locale === "en" ? "fr" : "en";
  const rest = pathname.split("/").slice(2).join("/");
  const href = `/${other}${rest ? `/${rest}` : ""}`;
  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={labels.switchLabel}
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
      {labels.switchTo}
    </Link>
  );
}

function NavList({ groups, pathname, onNavigate }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void }) {
  const current = pathname.replace(/\/$/, "");
  return (
    <>
      {groups.map((g) => (
        <div key={g.label} className="mb-6">
          <p className="px-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">{g.label}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((item) => {
              const active = current === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2 text-sm font-semibold ${
                      active ? "bg-green-soft text-green" : "text-ink hover:bg-card"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function DocsShell({
  locale,
  groups,
  labels,
  children,
}: {
  locale: Locale;
  groups: NavGroup[];
  labels: Labels;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // The drawer is open only for the page it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const flat = groups.flatMap((g) => g.items);
  const index = flat.findIndex((i) => i.href === pathname.replace(/\/$/, ""));
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:text-on-accent"
        >
          {labels.skip}
        </a>
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href={`/${locale}`} className="shrink-0" aria-label="PayVault">
            <Logo />
          </Link>
          <Link
            href={`/${locale}/docs`}
            className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-bold text-green"
          >
            {labels.docs}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitch locale={locale} labels={labels} />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-navy lg:hidden"
              aria-expanded={open}
              aria-controls="docs-drawer"
              aria-label={open ? labels.closeMenu : labels.menu}
              onClick={() => setOpenAt(open ? null : pathname)}
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
        {open && (
          <div id="docs-drawer" className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-paper lg:hidden">
            <nav aria-label={labels.navLabel} className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
              <NavList groups={groups} pathname={pathname} onNavigate={() => setOpenAt(null)} />
            </nav>
          </div>
        )}
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <nav
            aria-label={labels.navLabel}
            className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-10 pr-2"
          >
            <NavList groups={groups} pathname={pathname} />
          </nav>
        </aside>
        <main id="main" className="min-w-0 py-8 lg:py-12">
          <div className="max-w-3xl">
            {children}
            {(prev || next) && (
              <nav className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="Pagination">
                {prev ? (
                  <Link href={prev.href} className="flex items-center gap-2 rounded-2xl border border-line bg-card p-4 hover:bg-card-2">
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <span>
                      <span className="block text-xs font-semibold text-muted">{labels.prev}</span>
                      <span className="font-display font-medium text-navy">{prev.title}</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={next.href}
                    className="flex items-center justify-end gap-2 rounded-2xl border border-line bg-card p-4 text-right hover:bg-card-2"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-muted">{labels.next}</span>
                      <span className="font-display font-medium text-navy">{next.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

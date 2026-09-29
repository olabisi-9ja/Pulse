"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Code2,
  Globe,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Users,
  Vault,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/lib/i18n";
import type { ConsoleMessages } from "@/messages/console";

type Item = { key: keyof ConsoleMessages["nav"]; path: string; icon: typeof Vault };

const ITEMS: Item[] = [
  { key: "overview", path: "", icon: LayoutDashboard },
  { key: "metrics", path: "/metrics", icon: Activity },
  { key: "allowances", path: "/allowances", icon: Vault },
  { key: "payments", path: "/payments", icon: ArrowLeftRight },
  { key: "risk", path: "/risk", icon: ShieldAlert },
  { key: "credit", path: "/credit", icon: HandCoins },
  { key: "users", path: "/users", icon: Users },
  { key: "developers", path: "/developers", icon: Code2 },
  { key: "settings", path: "/settings", icon: Settings },
];

function setCookie(value: string) {
  try {
    document.cookie = value;
  } catch {
    /* ignore */
  }
}

export type ShellMembership = { partnerId: string; name: string; role: string };

export function Shell({
  locale,
  t,
  memberships,
  fallbackId,
  email,
  roleLabels,
  children,
}: {
  locale: Locale;
  t: ConsoleMessages["nav"];
  memberships: ShellMembership[];
  fallbackId: string;
  email: string;
  roleLabels: Record<string, string>;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? `/${locale}/console`;
  const search = useSearchParams();
  const router = useRouter();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  const p = search.get("p");
  const active = memberships.find((m) => m.partnerId === p)?.partnerId ?? fallbackId;
  const multi = memberships.length > 1;
  const base = `/${locale}/console`;
  const qs = multi ? `?p=${active}` : "";
  const rest = pathname.slice(base.length);
  const onboarding = rest.startsWith("/onboarding");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const other: Locale = locale === "en" ? "fr" : "en";
  const otherHref = `/${other}${pathname.split("/").slice(2).map((s) => `/${s}`).join("")}${search.toString() ? `?${search}` : ""}`;

  function switchPartner(id: string) {
    setCookie(`pv_partner=${id}; path=/; max-age=31536000; samesite=lax`);
    router.push(`${base}${rest.startsWith("/allowances/") ? "/allowances" : rest}?p=${id}`);
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => undefined);
    router.push(`/${locale}`);
    router.refresh();
  }

  const nav = (
    <nav aria-label={t.console} className="flex flex-col gap-0.5">
      {ITEMS.map(({ key, path, icon: Icon }) => {
        const current = path === "" ? rest === "" || rest === "/" : rest === path || rest.startsWith(`${path}/`);
        return (
          <Link
            key={key}
            href={`${base}${path}${qs}`}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
              current ? "bg-green-soft text-green" : "text-ink hover:bg-card-2"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {t[key]}
          </Link>
        );
      })}
      <Link
        href={`/${locale}/docs`}
        className="mt-2 flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-card-2"
      >
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
        {t.docs}
      </Link>
    </nav>
  );

  const account = (
    <div className="flex flex-col gap-3">
      <div className="min-w-0 text-xs text-muted">
        {t.signedInAs}
        <p className="truncate font-semibold text-ink">{email}</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={otherHref}
          hrefLang={other}
          lang={other}
          onClick={() => {
            setCookie(`pv_locale=${other}; path=/; max-age=31536000; samesite=lax`);
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-semibold text-navy hover:bg-card-2"
          aria-label={t.language}
        >
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {other === "fr" ? "Français" : "English"}
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-semibold text-ink hover:bg-card-2"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          {t.signOut}
        </button>
      </div>
    </div>
  );

  const switcher =
    multi && !onboarding ? (
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        {t.partner}
        <select
          value={active}
          onChange={(e) => switchPartner(e.target.value)}
          className="min-h-10 w-full rounded-xl border border-line bg-card px-3 text-sm font-semibold text-ink"
        >
          {memberships.map((m) => (
            <option key={m.partnerId} value={m.partnerId}>
              {m.name} ({roleLabels[m.role] ?? m.role})
            </option>
          ))}
        </select>
      </label>
    ) : !onboarding ? (
      <div className="rounded-xl border border-line bg-card-2 px-3 py-2">
        <p className="truncate text-sm font-semibold text-ink">{memberships.find((m) => m.partnerId === active)?.name}</p>
        <p className="text-xs text-muted">{roleLabels[memberships.find((m) => m.partnerId === active)?.role ?? ""]}</p>
      </div>
    ) : null;

  const panel = (
    <div className="flex h-full flex-col gap-5 p-4">
      <Link href={`${base}${qs}`} aria-label="PayVault">
        <Logo />
      </Link>
      {switcher}
      {!onboarding && <div className="flex-1 overflow-y-auto">{nav}</div>}
      {onboarding && <div className="flex-1" />}
      {account}
    </div>
  );

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-card lg:sticky lg:top-0 lg:block lg:h-dvh">{panel}</aside>

      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-card px-4 lg:hidden">
        <Link href={`${base}${qs}`} aria-label="PayVault">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpenAt(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="console-drawer"
          aria-label={open ? t.close : t.menu}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-card-2"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label={t.close} onClick={() => setOpenAt(null)} className="absolute inset-0 bg-ink/40" />
          <div id="console-drawer" className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-card">
            {panel}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

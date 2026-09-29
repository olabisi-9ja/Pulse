"use client";
import { ArrowDownLeft, ArrowUpRight, Cloud, CloudOff, Home, LineChart, Loader2, ScanLine, ShieldCheck, User, Vault } from "lucide-react";
import { money, relativeTime, shortDate } from "@/lib/client/money";
import type { OutboxItem } from "@/lib/client/offline";
import { type Connectivity, useApp } from "@/lib/client/store";
import type { AppSnapshot } from "@/lib/server/snapshot";
import { useI18n } from "./I18n";

export type Tab = "home" | "activity" | "vault" | "profile";

export function ConnectivityPill() {
  const { m, t, locale } = useI18n();
  const c = useApp((s) => s.connectivity);
  const pending = useApp((s) => s.outbox.filter((i) => i.status === "pending").length);
  const lastSyncAt = useApp((s) => s.lastSyncAt);
  const retryIn = useApp((s) => s.retryIn);
  const tone: Record<Connectivity, string> = {
    online: "bg-green-soft text-green",
    settled: "bg-green-soft text-green",
    degraded: "bg-warn-soft text-warn",
    offline: "bg-navy-soft text-navy",
    reconnecting: "bg-warn-soft text-warn",
    reconciling: "bg-navy-soft text-navy",
  };
  const Icon = c === "offline" ? CloudOff : c === "reconciling" || c === "reconnecting" ? Loader2 : Cloud;
  const detail = pending
    ? t(m.status.pending, { n: pending })
    : lastSyncAt
      ? t(m.status.lastSync, { time: relativeTime(lastSyncAt, locale) })
      : m.status.never;
  return (
    <button
      onClick={() => void useApp.getState().sync("manual")}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${tone[c]}`}
      aria-live="polite"
      title={retryIn ? t(m.status.retryIn, { s: retryIn }) : detail}
    >
      <Icon className={`h-3.5 w-3.5 ${Icon === Loader2 ? "animate-spin" : ""}`} aria-hidden />
      <span>{m.status[c]}</span>
      <span className="font-medium opacity-80">· {detail}</span>
    </button>
  );
}

export function BottomNav({ tab, setTab, onScan }: { tab: Tab; setTab: (t: Tab) => void; onScan: () => void }) {
  const { m } = useI18n();
  const item = (id: Tab, label: string, Icon: typeof Home) => (
    <button
      onClick={() => setTab(id)}
      aria-current={tab === id ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${tab === id ? "text-ink" : "text-muted"}`}
    >
      <Icon className="h-6 w-6" strokeWidth={tab === id ? 2.2 : 1.8} aria-hidden />
      {label}
    </button>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-end px-2">
        {item("home", m.nav.home, Home)}
        {item("activity", m.nav.activity, LineChart)}
        <div className="flex flex-1 justify-center">
          <button
            onClick={onScan}
            aria-label={m.nav.scan}
            className="-mt-7 grid h-16 w-16 place-items-center rounded-full bg-green text-on-accent shadow-[0_10px_30px_-8px_var(--pv-green)] transition active:scale-95"
          >
            <ScanLine className="h-7 w-7" />
          </button>
        </div>
        {item("vault", m.nav.vault, Vault)}
        {item("profile", m.nav.profile, User)}
      </div>
    </nav>
  );
}

type Row = {
  key: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  incoming: boolean;
  badge?: { label: string; tone: "warn" | "danger" | "muted" | "green" };
  note?: string;
};

export function TxRow({ row }: { row: Row }) {
  const { locale } = useI18n();
  const tones = { warn: "bg-warn-soft text-warn", danger: "bg-danger-soft text-danger", muted: "bg-card-2 text-muted", green: "bg-green-soft text-green" };
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-card-2 text-ink">
        {row.incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{row.title}</p>
        <p className="truncate text-sm text-muted">
          {row.subtitle}
          {row.note ? ` · ${row.note}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={`tabular font-semibold ${row.incoming ? "text-green" : "text-ink"}`}>
          {row.incoming ? "+" : "−"}
          {money(Math.abs(row.amount), row.currency, locale)}
        </p>
        {row.badge && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[row.badge.tone]}`}>{row.badge.label}</span>}
      </div>
    </li>
  );
}

/** Merges locally queued offline payments with the server's ledger feed. */
export function useRows(limit?: number, filter: "all" | "offline" | "online" = "all"): Row[] {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const outbox = useApp((s) => s.outbox);
  const rows: (Row & { at: number })[] = [];

  const pending = outbox.filter((i) => i.status !== "settled" && i.status !== "duplicate");
  for (const i of pending) rows.push({ ...outboxRow(i), at: i.createdAt });

  for (const a of (snapshot?.activity ?? []) as AppSnapshot["activity"]) {
    // Hide pure internal moves of the vault account; the wallet side tells the story.
    if (a.account === "vault" && (a.kind === "vault_load" || a.kind === "vault_cashout" || a.kind === "vault_expiry")) continue;
    const offline = !!a.offline;
    if (filter === "offline" && !offline) continue;
    if (filter === "online" && offline) continue;
    const kinds = m.activity.kinds;
    const incoming = a.amount > 0;
    let title = kinds[a.kind] ?? a.kind;
    if (offline) title = incoming ? t(m.activity.receivedFrom, { name: a.counterparty || m.activity.customer }) : t(m.activity.paidTo, { name: a.counterparty || "—" });
    else if (a.counterparty) title = `${title} · ${a.counterparty}`;
    rows.push({
      key: a.id,
      at: new Date(a.at).getTime(),
      title,
      subtitle: shortDate(a.at, locale),
      amount: a.amount,
      currency: a.currency,
      incoming,
      note: a.offline && a.offline.fromCredit > 0 && !incoming ? t(m.activity.viaOverdraft, { amount: money(a.offline.fromCredit, a.currency, locale) }) : undefined,
      badge: a.offline?.status === "flagged" ? { label: m.activity.statuses.flagged, tone: "danger" } : undefined,
    });
  }
  if (filter === "online") return rows.filter((r) => !r.key.startsWith("ob:")).slice(0, limit);

  function outboxRow(i: OutboxItem): Row {
    const incoming = i.role === "merchant";
    return {
      key: `ob:${i.role}:${i.id}`,
      title: incoming ? t(m.activity.receivedFrom, { name: m.activity.customer }) : t(m.activity.paidTo, { name: i.counterparty || "—" }),
      subtitle: shortDate(i.createdAt, locale),
      amount: incoming ? i.amount : -i.amount,
      currency: i.currency,
      incoming,
      note: i.fromCredit > 0 && !incoming ? t(m.activity.viaOverdraft, { amount: money(i.fromCredit, i.currency, locale) }) : undefined,
      badge:
        i.status === "pending"
          ? { label: m.activity.statuses.pending, tone: "warn" }
          : i.status === "rejected"
            ? { label: m.activity.statuses.rejected, tone: "danger" }
            : i.status === "flagged"
              ? { label: m.activity.statuses.flagged, tone: "danger" }
              : undefined,
    };
  }
  return rows.sort((a, b) => b.at - a.at).slice(0, limit);
}

export function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span className="grid h-12 w-12 place-items-center rounded-full bg-navy font-display text-lg font-bold text-paper" aria-hidden>
      {initials || <ShieldCheck className="h-5 w-5" />}
    </span>
  );
}

"use client";
import { ArrowDownLeft, ArrowUpRight, CircleUser, Home, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";
import { money, shortDate } from "@/lib/client/money";
import type { OutboxItem } from "@/lib/client/offline";
import { useApp } from "@/lib/client/store";
import type { AppSnapshot } from "@/lib/server/snapshot";
import { useI18n } from "./I18n";
import { StatusPill } from "./ui";

export type Tab = "home" | "activity" | "vault" | "profile";

export function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { m } = useI18n();
  const items: [Tab, string, typeof Home][] = [
    ["home", m.nav.home, Home],
    ["activity", m.nav.activity, ReceiptText],
    ["vault", m.nav.vault, LockKeyhole],
    ["profile", m.nav.profile, CircleUser],
  ];
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-paper p-1.5 shadow-[var(--pv-shadow)] ring-1 ring-line">
        {items.map(([id, label, Icon]) =>
          tab === id ? (
            <button
              key={id}
              aria-current="page"
              className="flex h-14 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper"
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </button>
          ) : (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-label={label}
              className="grid h-14 w-14 place-items-center rounded-full text-muted transition hover:text-ink"
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} aria-hidden />
            </button>
          ),
        )}
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
  const tones = { warn: "info", danger: "danger", muted: "muted", green: "success" } as const;
  return (
    <li className="flex items-center gap-3 py-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-ink">
        {row.incoming ? <ArrowDownLeft className="h-[18px] w-[18px]" /> : <ArrowUpRight className="h-[18px] w-[18px]" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">{row.title}</p>
        <p className="truncate text-[13px] text-muted">
          {row.subtitle}
          {row.note ? ` · ${row.note}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className={`tabular text-[15px] font-medium ${row.incoming ? "text-green" : "text-ink"}`}>
          {row.incoming ? "+" : "−"}
          {money(Math.abs(row.amount), row.currency, locale)}
        </p>
        {row.badge && <StatusPill tone={tones[row.badge.tone]}>{row.badge.label}</StatusPill>}
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
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-base font-medium text-paper" aria-hidden>
      {initials || <ShieldCheck className="h-5 w-5" />}
    </span>
  );
}

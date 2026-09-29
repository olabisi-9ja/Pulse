"use client";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, MapPin, ScanLine } from "lucide-react";
import { useState } from "react";
import { money, shortDate } from "@/lib/client/money";
import { vaultSummary } from "@/lib/client/offline";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { Initials, type Tab, TxRow, useRows } from "./parts";
import { Card, SectionHead, StatusPill } from "./ui";

export function HomeScreen({
  onPay,
  onRequest,
  onAdd,
  setTab,
}: {
  onPay: () => void;
  onRequest: () => void;
  onAdd: () => void;
  setTab: (t: Tab) => void;
}) {
  const { m, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const vault = vaultSummary(useApp((s) => s.vault));
  const [hidden, setHidden] = useState(false);
  const rows = useRows(5);
  if (!snapshot) return null;
  const u = snapshot.user;
  const cur = u.currency;
  const show = (v: number) => (hidden ? "••••••" : money(v, cur, locale));
  const firstName = u.displayName.split(/\s+/)[0] ?? "";
  const place = regionName(u.country, locale);

  return (
    <div className="space-y-7 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
      <header className="flex items-center gap-3">
        <Initials name={u.displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-medium text-ink">
            {m.home.welcome} {firstName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {place} · {snapshot.partner.name}
          </p>
        </div>
        <button
          onClick={onPay}
          aria-label={m.nav.scan}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-[var(--pv-shadow)] ring-1 ring-line"
        >
          <ScanLine className="h-5 w-5" />
        </button>
      </header>

      <section className="rounded-[28px] bg-ink p-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm opacity-70">{m.home.balance}</p>
          <button onClick={onAdd} className="h-11 shrink-0 rounded-full bg-paper px-5 text-[15px] font-medium text-ink">
            {m.home.topUp}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <p className="tabular min-w-0 truncate text-[34px] leading-tight font-medium tracking-tight">{show(snapshot.balances.wallet)}</p>
          <button onClick={() => setHidden((h) => !h)} aria-label={hidden ? "Show balances" : "Hide balances"} className="shrink-0 opacity-80">
            {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {u.merchant && (
          <p className="mt-1 text-[13px] opacity-60">
            {m.home.merchant}: {show(snapshot.balances.merchant)}
          </p>
        )}
        <div className="mt-7 flex gap-3">
          <PillAction onClick={onRequest} icon={<ArrowDownLeft className="h-5 w-5" />}>
            {m.home.request}
          </PillAction>
          <PillAction onClick={onPay} icon={<ArrowUpRight className="h-5 w-5" />}>
            {m.home.pay}
          </PillAction>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHead title={m.home.vault} />
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] text-muted">{m.vault.remaining}</p>
              <p className="tabular mt-1 text-[22px] font-medium text-ink">{vault ? show(vault.remaining) : show(0)}</p>
            </div>
            {vault ? <StatusPill>{m.home.vaultReady}</StatusPill> : <StatusPill tone="muted">{m.home.noVault}</StatusPill>}
          </div>
          {vault ? (
            <>
              <div className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <span className="bg-ink" style={{ width: `${(vault.fundedRemaining / vault.cap) * 100}%` }} />
                <span className="bg-navy" style={{ width: `${(vault.creditRemaining / vault.cap) * 100}%` }} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <Fact label={m.vault.funded} value={show(vault.fundedRemaining)} />
                <Fact label={m.vault.overdraft} value={show(vault.creditRemaining)} />
                <Fact label={m.home.expiresLabel} value={shortDate(vault.expiresAt, locale)} end />
              </dl>
            </>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-[13px] text-muted">{m.home.vaultEmptyHint}</p>
              <button onClick={() => setTab("vault")} className="h-11 shrink-0 rounded-full bg-ink px-5 text-sm font-medium text-paper">
                {m.home.loadVault}
              </button>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHead title={m.home.transactions} action={{ label: m.home.viewAll, onClick: () => setTab("activity") }} />
        <Card className="px-4 py-1">
          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <TxRow key={r.key} row={r} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-muted">{m.home.empty}</p>
          )}
        </Card>
      </section>
    </div>
  );
}

function regionName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function Fact({ label, value, end }: { label: string; value: string; end?: boolean }) {
  return (
    <div className={end ? "text-right" : ""}>
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="tabular mt-0.5 text-[13px] font-medium text-ink">{value}</dd>
    </div>
  );
}

function PillAction({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-paper text-[15px] font-medium text-ink ring-4 ring-paper/15 transition active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  );
}

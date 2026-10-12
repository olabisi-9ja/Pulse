"use client";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Radio, ScanLine, Store } from "lucide-react";
import { useState } from "react";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { minorUnitsOf, money, shortDate } from "@/lib/client/money";
import { vaultSummary } from "@/lib/client/offline";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { Initials, type Tab, TxRow, useApprox, useRows } from "./parts";
import { Button, Card, Notice, SectionHead, StatusPill } from "./ui";

export function HomeScreen({
  onPay,
  onRequest,
  onAdd,
  onTap,
  setTab,
}: {
  onPay: () => void;
  onRequest: () => void;
  onAdd: () => void;
  onTap?: () => void;
  setTab: (t: Tab) => void;
}) {
  const { m, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const vault = vaultSummary(useApp((s) => s.vault));
  const [hidden, setHidden] = useState(false);
  const rows = useRows(5);
  const approxOf = useApprox();
  if (!snapshot) return null;
  const u = snapshot.user;
  const cur = u.currency;
  const show = (v: number) => (hidden ? "••••••" : money(v, cur, locale));
  const firstName = u.displayName.split(/\s+/)[0] ?? "";

  return (
    <div className="space-y-7 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
      <header className="flex items-center gap-3">
        <Initials name={u.displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-medium text-ink">
            {m.home.welcome} {firstName}
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

      <section className="rounded-[28px] bg-brand p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm opacity-70">{m.home.balance}</p>
          <button onClick={onAdd} className="h-11 shrink-0 rounded-full bg-accent px-5 text-[15px] font-medium text-white">
            {m.home.topUp}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <p className="tabular min-w-0 truncate text-[34px] leading-tight font-medium tracking-tight">{show(snapshot.balances.wallet)}</p>
          <button onClick={() => setHidden((h) => !h)} aria-label={hidden ? "Show balances" : "Hide balances"} className="shrink-0 opacity-80">
            {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {!hidden && approxOf(snapshot.balances.wallet, cur) && (
          <p className="tabular text-sm opacity-70">{approxOf(snapshot.balances.wallet, cur)}</p>
        )}
        {u.merchant && (
          <p className="mt-1 text-[13px] opacity-60">
            {m.home.merchant}: {show(snapshot.balances.merchant)}
          </p>
        )}
        <div className="mt-7 flex gap-2">
          <PillAction onClick={onRequest} icon={<ArrowDownLeft className="h-5 w-5" />}>
            {m.home.request}
          </PillAction>
          <PillAction onClick={onPay} icon={<ArrowUpRight className="h-5 w-5" />}>
            {m.home.pay}
          </PillAction>
          {onTap && (
            <PillAction onClick={onTap} icon={<Radio className="h-5 w-5 text-accent-text" />}>
              {m.home.tap}
            </PillAction>
          )}
        </div>
      </section>

      <BusinessCard hidden={hidden} />

      <section className="space-y-3">
        <SectionHead title={m.home.vault} />
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="tabular text-[22px] font-medium text-ink">{show(vault?.remaining ?? 0)}</p>
            {vault ? (
              <StatusPill>{m.home.vaultReady}</StatusPill>
            ) : (
              <button onClick={() => setTab("vault")} className="h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-medium text-white">
                {m.home.loadVault}
              </button>
            )}
          </div>
          {vault && (
            <>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <span className="bg-brand" style={{ width: `${(vault.fundedRemaining / vault.cap) * 100}%` }} />
                <span className="bg-accent" style={{ width: `${(vault.creditRemaining / vault.cap) * 100}%` }} />
              </div>
              <p className="mt-3 text-[13px] text-muted">
                {m.home.expiresLabel} {shortDate(vault.expiresAt, locale)}
              </p>
            </>
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

function PillAction({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-brand transition active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * For traders: the last 30 days of takings that count toward credit (Track 3 pitch).
 * In the sandbox it can load three weeks of demo sales.
 */
function BusinessCard({ hidden }: { hidden: boolean }) {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const b = snapshot?.business;
  if (!snapshot || !b) return null;
  const cur = snapshot.user.currency;
  const show = (v: number) => (hidden ? "••••" : money(v, cur, locale));
  const canSeed = snapshot.partner.sandbox && b.tradingDays < 5;

  const seed = async () => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/app/demo/seed", {}, 60_000);
      await useApp.getState().refresh();
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <SectionHead title={m.business.title} />
      <Card className="space-y-4">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label={m.business.tradingDays} value={`${b.tradingDays}/30`} />
          <Stat label={m.business.sales} value={hidden ? "••••" : compact(b.takings, cur, locale)} />
          <Stat label={m.business.customers} value={String(b.customers)} />
        </dl>
        <div className="flex items-center justify-between gap-3 rounded-[20px] bg-card-2 px-4 py-3.5">
          <span className="flex items-center gap-2 text-sm text-muted">
            <Store className="h-4 w-4" /> {m.business.unlocked}
          </span>
          <span className="tabular font-medium text-ink">{show(snapshot.credit.limit)}</span>
        </div>
        <p className="text-[13px] text-muted">
          {snapshot.credit.reason === "kyc_required" ? m.business.verify : t(m.business.hint, { score: snapshot.credit.score })}
        </p>
        {error && <Notice tone="danger">{error}</Notice>}
        {canSeed && (
          <Button variant="secondary" className="w-full" loading={busy} onClick={() => void seed()}>
            {m.business.seed}
          </Button>
        )}
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[20px] bg-card-2 px-2 py-3">
      <dd className="tabular truncate text-[15px] font-medium text-ink">{value}</dd>
      <dt className="mt-0.5 text-[12px] text-muted">{label}</dt>
    </div>
  );
}

/** "₦92K": fits a narrow stat tile. */
function compact(minor: number, currency: string, locale: string): string {
  const major = minor / 10 ** minorUnitsOf(currency);
  return new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 0 }).format(major);
}

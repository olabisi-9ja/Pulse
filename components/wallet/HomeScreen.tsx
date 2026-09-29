"use client";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Store, Vault, Wallet } from "lucide-react";
import { useState } from "react";
import { money, shortDate } from "@/lib/client/money";
import { vaultSummary } from "@/lib/client/offline";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { ConnectivityPill, Initials, type Tab, TxRow, useRows } from "./parts";

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
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const snapshotAt = useApp((s) => s.snapshotAt);
  const vault = vaultSummary(useApp((s) => s.vault));
  const [hidden, setHidden] = useState(false);
  const rows = useRows(6);
  if (!snapshot) return null;
  const cur = snapshot.user.currency;
  const show = (v: number) => (hidden ? "••••••" : money(v, cur, locale));

  return (
    <div className="pb-4">
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Initials name={snapshot.user.displayName} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{m.home.welcome}</p>
          <p className="truncate text-lg font-semibold text-ink">{snapshot.user.displayName}</p>
        </div>
        <button
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? "Show balances" : "Hide balances"}
          className="grid h-12 w-12 place-items-center rounded-full bg-card text-ink"
        >
          {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </header>
      <div className="mt-3 px-4">
        <ConnectivityPill />
      </div>

      <h1 className="mt-6 px-4 font-display text-3xl font-bold tracking-tight text-ink">{m.home.accounts}</h1>
      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <AccountCard
          icon={<Vault className="h-4 w-4" />}
          label={m.home.vault}
          hint={m.home.vaultHint}
          value={vault ? show(vault.remaining) : m.home.noVault}
          footLeft={vault && vault.creditRemaining > 0 ? t(m.home.overdraftLeft, { amount: show(vault.creditRemaining) }) : vault ? "" : undefined}
          footRight={vault ? t(m.home.expires, { date: shortDate(vault.expiresAt, locale) }) : undefined}
          accent
          action={!vault ? { label: m.home.loadVault, onClick: () => setTab("vault") } : undefined}
        />
        <AccountCard
          icon={<Wallet className="h-4 w-4" />}
          label={m.home.wallet}
          hint={m.home.walletHint}
          value={show(snapshot.balances.wallet)}
          footLeft={snapshotAt ? t(m.home.asOf, { time: shortDate(snapshotAt, locale) }) : ""}
          footRight={cur}
        />
        {snapshot.user.merchant && (
          <AccountCard
            icon={<Store className="h-4 w-4" />}
            label={m.home.merchant}
            hint={snapshot.user.merchant.name}
            value={show(snapshot.balances.merchant)}
            footLeft={m.home.merchantHint}
            footRight={cur}
          />
        )}
      </div>

      <div className="mt-4 flex gap-3 px-4">
        <ActionButton onClick={onRequest} icon={<ArrowDownLeft className="h-5 w-5" />}>
          {m.home.request}
        </ActionButton>
        <ActionButton onClick={onPay} icon={<ArrowUpRight className="h-5 w-5" />}>
          {m.home.pay}
        </ActionButton>
        <button
          onClick={onAdd}
          aria-label={m.home.add}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-green-soft text-green transition active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <section className="mt-6 rounded-t-[32px] border-t border-line bg-card px-4 pt-3">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line" aria-hidden />
        <div className="mt-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">{m.home.transactions}</h2>
          <button onClick={() => setTab("activity")} className="text-sm font-medium text-muted">
            {m.home.viewAll}
          </button>
        </div>
        {rows.length ? (
          <ul className="mt-2 divide-y divide-line">
            {rows.map((r) => (
              <TxRow key={r.key} row={r} />
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-muted">{m.home.empty}</p>
        )}
      </section>
    </div>
  );
}

function AccountCard(props: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: string;
  footLeft?: string;
  footRight?: string;
  accent?: boolean;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <article
      className={`flex w-[82%] max-w-[320px] shrink-0 snap-start flex-col rounded-[28px] p-5 ${
        props.accent ? "bg-navy text-paper dark:bg-navy-soft dark:text-ink" : "border border-line bg-card text-ink"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${props.accent ? "bg-white/10" : "bg-card-2"}`}>
          {props.icon}
          {props.label}
        </span>
      </div>
      <p className={`mt-5 text-sm ${props.accent ? "opacity-70" : "text-muted"}`}>{props.hint}</p>
      <p className="mt-1 font-display text-[2rem] leading-tight font-bold tabular">{props.value}</p>
      {props.action ? (
        <button onClick={props.action.onClick} className="mt-4 self-start rounded-full bg-green px-4 py-2 text-sm font-semibold text-on-accent">
          {props.action.label}
        </button>
      ) : (
        <div className={`mt-5 flex justify-between gap-2 text-xs ${props.accent ? "opacity-70" : "text-muted"}`}>
          <span>{props.footLeft}</span>
          <span>{props.footRight}</span>
        </div>
      )}
    </article>
  );
}

function ActionButton({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-card text-[15px] font-semibold text-ink transition active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  );
}

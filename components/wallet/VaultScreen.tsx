"use client";
import { BadgeCheck, CreditCard, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { money, parseMajor, shortDate } from "@/lib/client/money";
import { clearVault, installVault, signCloseStatement, vaultSummary } from "@/lib/client/offline";
import { checkPin, getDeviceKey } from "@/lib/client/security";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { PinPad } from "./PinPad";
import { Button, Card, Field, Notice, Select, Sheet } from "./ui";

export function VaultScreen({ toast }: { toast: (s: string) => void }) {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const userId = useApp((s) => s.userId)!;
  const vaultState = useApp((s) => s.vault);
  const vault = vaultSummary(vaultState);
  const [pinFor, setPinFor] = useState<null | "cashout">(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!snapshot) return null;
  const cur = snapshot.user.currency;
  const f = (v: number) => money(v, cur, locale);

  const serverActive = snapshot.allowances.find((a) => a.status === "active");
  const activeElsewhere = !vault && serverActive;

  const cashOut = async (pin: string) => {
    setBusy(true);
    setPinError(null);
    const ok = await checkPin(userId, pin);
    if (!ok.ok) {
      setBusy(false);
      setPinError(ok.reason === "locked" ? m.pin.locked : t(m.pin.wrong, { n: ok.attemptsLeft ?? 0 }));
      return;
    }
    try {
      const device = await getDeviceKey(userId);
      const close = await signCloseStatement(userId, device.keyPair.privateKey);
      const res = await api<{ refunded: number }>("/api/app/vault/close", { close });
      await clearVault(userId);
      await useApp.getState().sync("cashout");
      setPinFor(null);
      toast(t(m.vault.cashedOut, { amount: f(res.refunded) }));
    } catch (err) {
      setPinError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{m.vault.title}</h1>
        <p className="mt-1 text-muted">{m.vault.subtitle}</p>
      </header>

      {vault ? (
        <Card className="bg-navy text-paper dark:bg-navy-soft dark:text-ink">
          <p className="text-sm opacity-70">{m.vault.remaining}</p>
          <p className="mt-1 font-display text-4xl font-bold tabular">{f(vault.remaining)}</p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <div className="flex h-full">
              <span className="bg-[#2fb386]" style={{ width: `${(vault.fundedRemaining / vault.cap) * 100}%` }} />
              <span className="bg-[#e7b35a]" style={{ width: `${(vault.creditRemaining / vault.cap) * 100}%` }} />
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <Stat label={m.vault.funded} value={f(vault.fundedRemaining)} />
            <Stat label={m.vault.overdraft} value={f(vault.creditRemaining)} />
            <Stat label={m.vault.spent} value={f(vault.spent)} />
          </dl>
          <p className="mt-4 text-xs opacity-70">
            {t(m.vault.payments, { n: vaultState?.seq ?? 0 })} · {t(m.vault.expires, { date: shortDate(vault.expiresAt, locale) })}
          </p>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setPinFor("cashout")}>
            <LogOut className="h-4 w-4" /> {m.vault.cashOut}
          </Button>
          <p className="mt-2 text-center text-xs opacity-70">{m.vault.cashOutHint}</p>
        </Card>
      ) : activeElsewhere ? (
        <Notice tone="warn">{m.vault.otherDevice}</Notice>
      ) : (
        <LoadVault toast={toast} />
      )}

      <CreditCardPanel />
      {snapshot.user.kycTier === "tier0" && <KycPanel toast={toast} />}

      <Sheet open={pinFor === "cashout"} onClose={() => setPinFor(null)} title={m.vault.cashOut}>
        <PinPad title={m.pin.enter} hint={m.vault.cashOutHint} error={pinError} busy={busy} onSubmit={(p) => void cashOut(p)} />
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs opacity-70">{label}</dt>
      <dd className="tabular font-semibold">{value}</dd>
    </div>
  );
}

function LoadVault({ toast }: { toast: (s: string) => void }) {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot)!;
  const userId = useApp((s) => s.userId)!;
  const cur = snapshot.user.currency;
  const [amount, setAmount] = useState("");
  const [credit, setCredit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const funded = parseMajor(amount, cur) ?? 0;
  const maxFunded = Math.min(snapshot.limits.maxFunded, snapshot.balances.wallet);
  const creditAvail = snapshot.credit.available;

  const load = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const device = await getDeviceKey(userId);
      if (!device.deviceId) throw new Error("device");
      const res = await api<{ cert: string }>("/api/app/vault", {
        deviceId: device.deviceId,
        funded,
        credit: credit ? creditAvail : 0,
      });
      await installVault(userId, res.cert);
      await useApp.getState().sync("vault");
      setAmount("");
      toast(m.vault.loaded);
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  const unavailable = m.vault.overdraftUnavailable as Record<string, string>;
  return (
    <Card>
      <form onSubmit={load} className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{m.vault.loadTitle}</h2>
          <p className="mt-1 text-sm text-muted">{m.vault.loadHint}</p>
        </div>
        <Field
          label={m.vault.fundedAmount}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint={`${t(m.vault.maxFunded, { amount: money(snapshot.limits.maxFunded, cur, locale) })} · ${t(m.vault.walletBalance, {
            amount: money(snapshot.balances.wallet, cur, locale),
          })}`}
          error={funded > maxFunded ? m.pay.errors.over_cap : null}
        />
        {creditAvail > 0 ? (
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2 px-4 py-3">
            <span>
              <span className="block font-medium text-ink">{m.vault.addOverdraft}</span>
              <span className="text-sm text-muted">{t(m.vault.overdraftAvailable, { amount: money(creditAvail, cur, locale) })}</span>
            </span>
            <input type="checkbox" className="h-6 w-6 accent-[var(--pv-green)]" checked={credit} onChange={(e) => setCredit(e.target.checked)} />
          </label>
        ) : (
          <p className="text-sm text-muted">{unavailable[snapshot.credit.reason] ?? unavailable.ok}</p>
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        <Button type="submit" className="w-full" loading={busy} disabled={(funded <= 0 && !credit) || funded > maxFunded}>
          {m.vault.load}
        </Button>
      </form>
    </Card>
  );
}

function CreditCardPanel() {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot)!;
  const [busy, setBusy] = useState(false);
  const cur = snapshot.user.currency;
  const f = (v: number) => money(v, cur, locale);
  const open = snapshot.loans.filter((l) => l.status === "open" || l.status === "overdue");
  if (snapshot.credit.limit === 0 && !snapshot.loans.length) return null;

  const repay = async () => {
    setBusy(true);
    try {
      await api("/api/app/repay", {});
      await useApp.getState().refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-green" />
        <h2 className="font-display text-xl font-bold text-ink">{m.vault.credit}</h2>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-card-2 p-3">
          <dt className="text-muted">{m.vault.creditLimit}</dt>
          <dd className="tabular text-lg font-semibold text-ink">{f(snapshot.credit.limit)}</dd>
        </div>
        <div className="rounded-2xl bg-card-2 p-3">
          <dt className="text-muted">{m.vault.creditOutstanding}</dt>
          <dd className="tabular text-lg font-semibold text-ink">{f(snapshot.credit.outstanding)}</dd>
        </div>
      </dl>
      {snapshot.loans.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold text-muted">{m.vault.loans}</h3>
          <ul className="mt-2 divide-y divide-line">
            {snapshot.loans.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  <span className="tabular font-medium text-ink">{f(l.principal + l.fee - l.repaid)}</span>
                  <span className="ml-2 text-muted">{t(m.vault.due, { date: shortDate(l.dueAt, locale) })}</span>
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    l.status === "overdue" ? "bg-danger-soft text-danger" : l.status === "repaid" ? "bg-green-soft text-green" : "bg-warn-soft text-warn"
                  }`}
                >
                  {m.vault.loanStatus[l.status]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {open.length > 0 && (
        <Button className="mt-4 w-full" loading={busy} onClick={() => void repay()} disabled={snapshot.balances.wallet <= 0}>
          {m.vault.repay}
        </Button>
      )}
    </Card>
  );
}

function KycPanel({ toast }: { toast: (s: string) => void }) {
  const { m } = useI18n();
  const snapshot = useApp((s) => s.snapshot)!;
  const [idType, setIdType] = useState(snapshot.limits.idSystems[0] ?? "");
  const [idNumber, setIdNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/app/kyc", { idType, idNumber });
      await useApp.getState().refresh();
      toast(m.vault.verified);
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green" />
          <h2 className="font-display text-xl font-bold text-ink">{m.vault.kycTitle}</h2>
        </div>
        <p className="text-sm text-muted">{m.vault.kycHint}</p>
        <Select label={m.vault.idType} value={idType} onChange={(e) => setIdType(e.target.value)}>
          {snapshot.limits.idSystems.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Field label={m.vault.idNumber} required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} error={error} />
        <Button type="submit" variant="secondary" className="w-full" loading={busy}>
          <BadgeCheck className="h-4 w-4" /> {m.vault.verify}
        </Button>
      </form>
    </Card>
  );
}

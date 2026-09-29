"use client";
import { Download, KeyRound, LogOut, RefreshCw, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { money, parseMajor } from "@/lib/client/money";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { ConnectivityPill, TxRow, useRows } from "./parts";
import { Button, Card, Field, Notice, Sheet } from "./ui";

export function ActivityScreen() {
  const { m } = useI18n();
  const [filter, setFilter] = useState<"all" | "offline" | "online">("all");
  const rows = useRows(200, filter);
  const pending = useApp((s) => s.outbox.filter((i) => i.status === "pending").length);
  return (
    <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{m.activity.title}</h1>
      <div className="mt-3">
        <ConnectivityPill />
      </div>
      {pending > 0 && (
        <div className="mt-4">
          <Notice>
            <strong className="block">{m.activity.pendingTitle}</strong>
            {m.activity.pendingHint}
          </Notice>
        </div>
      )}
      <div className="mt-4 flex gap-2" role="tablist">
        {(["all", "offline", "online"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === f ? "bg-ink text-paper" : "bg-card text-muted"}`}
          >
            {m.activity[f]}
          </button>
        ))}
      </div>
      <Card className="mt-4 py-1">
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <TxRow key={r.key} row={r} />
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-muted">{m.home.empty}</p>
        )}
      </Card>
    </div>
  );
}

type InstallEvent = Event & { prompt: () => Promise<void> };

export function ProfileScreen({ locale, onSignOut }: { locale: "en" | "fr"; onSignOut: () => void }) {
  const { m, t } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const pending = useApp((s) => s.outbox.filter((i) => i.status === "pending").length);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [merchantOpen, setMerchantOpen] = useState(false);

  useEffect(() => {
    try {
      setTheme((localStorage.getItem("pv_theme") as typeof theme) ?? "system");
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const applyTheme = (v: typeof theme) => {
    setTheme(v);
    try {
      localStorage.setItem("pv_theme", v);
    } catch {}
    if (v === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", v);
  };

  const switchLocale = async (l: "en" | "fr") => {
    document.cookie = `pv_locale=${l}; path=/; max-age=31536000; samesite=lax`;
    await api("/api/app/profile", { locale: l }).catch(() => {});
    window.location.assign(`/${l}/app`);
  };

  if (!snapshot) return null;
  const u = snapshot.user;
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{m.profile.title}</h1>
      <Card className="divide-y divide-line py-1">
        {row(m.profile.email, <span className="break-all">{u.email}</span>)}
        {row(m.profile.country, `${u.country} · ${u.currency}`)}
        {row(m.profile.verification, m.vault.tier[u.kycTier])}
        {row(
          m.profile.merchantMode,
          <button onClick={() => setMerchantOpen(true)} className="inline-flex items-center gap-1.5 text-green">
            <Store className="h-4 w-4" />
            {u.merchant ? t(m.profile.merchantOn, { name: u.merchant.name }) : m.profile.merchantOff}
          </button>,
        )}
        <p className="py-3 text-sm text-muted">{t(m.profile.provider, { name: snapshot.partner.name })}</p>
      </Card>
      {snapshot.partner.sandbox && <Notice tone="warn">{m.profile.sandbox}</Notice>}

      <Card className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{m.profile.language}</p>
          <div className="flex gap-2">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => void switchLocale(l)}
                aria-pressed={locale === l}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === l ? "bg-ink text-paper" : "bg-card-2 text-ink"}`}
              >
                {l === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{m.profile.appearance}</p>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((v) => (
              <button
                key={v}
                onClick={() => applyTheme(v)}
                aria-pressed={theme === v}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${theme === v ? "bg-ink text-paper" : "bg-card-2 text-ink"}`}
              >
                {m.profile.theme[v]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 text-green" />
          <div>
            <p className="font-medium text-ink">{m.profile.device}</p>
            <p className="text-sm text-muted">{m.profile.deviceHint}</p>
          </div>
        </div>
        <ConnectivityPill />
        <Button variant="secondary" className="w-full" onClick={() => void useApp.getState().sync("manual")}>
          <RefreshCw className="h-4 w-4" /> {m.profile.syncNow}
        </Button>
        {install && (
          <Button variant="secondary" className="w-full" onClick={() => void install.prompt()}>
            <Download className="h-4 w-4" /> {m.profile.install}
          </Button>
        )}
      </Card>

      {pending > 0 && <Notice tone="warn">{t(m.profile.signOutWarn, { n: pending })}</Notice>}
      <Button variant="danger" className="w-full" onClick={onSignOut}>
        <LogOut className="h-4 w-4" /> {m.profile.signOut}
      </Button>

      <MerchantSheet open={merchantOpen} onClose={() => setMerchantOpen(false)} />
    </div>
  );
}

function MerchantSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { m } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const [name, setName] = useState(snapshot?.user.merchant?.name ?? snapshot?.user.displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/app/merchant", { name });
      await useApp.getState().refresh();
      onClose();
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} title={m.request.enableTitle}>
      <form onSubmit={save} className="space-y-4">
        <p className="text-muted">{m.request.enableHint}</p>
        <Field label={m.request.businessName} required maxLength={32} value={name} onChange={(e) => setName(e.target.value)} error={error} />
        <Button type="submit" className="w-full" loading={busy}>
          {m.common.save}
        </Button>
      </form>
    </Sheet>
  );
}

/** Online money movements: test top-up (sandbox), send to a user, move takings. */
export function AddSheet({ open, onClose, toast, onLoadVault }: { open: boolean; onClose: () => void; toast: (s: string) => void; onLoadVault: () => void }) {
  const { m, t, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const [mode, setMode] = useState<"topup" | "send">(snapshot?.partner.sandbox ? "topup" : "send");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!snapshot) return null;
  const cur = snapshot.user.currency;
  const minor = parseMajor(amount, cur);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setError(null);
    try {
      const msg = await fn();
      await useApp.getState().refresh();
      setAmount("");
      toast(msg);
      onClose();
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={m.add.title}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {snapshot.partner.sandbox && (
            <button
              onClick={() => setMode("topup")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "topup" ? "bg-ink text-paper" : "bg-card text-ink"}`}
            >
              {m.add.topUp}
            </button>
          )}
          <button
            onClick={() => setMode("send")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "send" ? "bg-ink text-paper" : "bg-card text-ink"}`}
          >
            {m.add.send}
          </button>
        </div>
        <p className="text-sm text-muted">{mode === "topup" ? m.add.topUpHint : m.add.sendHint}</p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!minor) return;
            if (mode === "topup")
              void run(async () => {
                await api("/api/app/topup", { amount: minor });
                return t(m.add.added, { amount: money(minor, cur, locale) });
              });
            else
              void run(async () => {
                await api("/api/app/transfer", { email, amount: minor, note });
                return t(m.add.sent, { amount: money(minor, cur, locale), email });
              });
          }}
        >
          {mode === "send" && (
            <Field label={m.add.recipient} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
          <Field label={m.add.amount} inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} hint={cur} />
          {mode === "send" && <Field label={`${m.add.note} (${m.common.optional})`} maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} />}
          {error && <Notice tone="danger">{error}</Notice>}
          <Button type="submit" className="w-full" loading={busy} disabled={!minor}>
            {m.common.continue}
          </Button>
        </form>
        <div className="grid gap-2 border-t border-line pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              onLoadVault();
            }}
          >
            {m.add.loadVault}
          </Button>
          {snapshot.user.merchant && snapshot.balances.merchant > 0 && (
            <Button
              variant="secondary"
              loading={busy}
              onClick={() =>
                void run(async () => {
                  const r = await api<{ moved: number }>("/api/app/sweep", {});
                  return t(m.add.swept, { amount: money(r.moved, cur, locale) });
                })
              }
            >
              {m.add.sweep}
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

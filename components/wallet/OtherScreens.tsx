"use client";
import { Download, LogOut, Nfc, Phone, Smartphone, Store } from "lucide-react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { minorUnitsOf, money, parseMajor, shortDate } from "@/lib/client/money";
import { getDeviceKey, getNoPinLimit, setNoPinLimit } from "@/lib/client/security";
import { stickerUrl } from "@/lib/client/sticker";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { QrCode } from "./QrCode";
import { TxRow, useRows } from "./parts";
import { Button, Card, Field, Notice, Select, Sheet } from "./ui";

export function ActivityScreen() {
  const { m } = useI18n();
  const [filter, setFilter] = useState<"all" | "offline" | "online">("all");
  const rows = useRows(200, filter);
  const pending = useApp((s) => s.outbox.filter((i) => i.status === "pending").length);
  return (
    <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <h1 className="text-[22px] font-medium tracking-tight text-ink">{m.activity.title}</h1>
      {pending > 0 && (
        <div className="mt-4">
          <Notice>{m.activity.pendingHint}</Notice>
        </div>
      )}
      <div className="mt-4 flex gap-2" role="tablist">
        {(["all", "offline", "online"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`h-11 rounded-full px-5 text-sm font-medium ${filter === f ? "bg-brand text-white" : "bg-card text-muted"}`}
          >
            {m.activity[f]}
          </button>
        ))}
      </div>
      <Card className="mt-4 px-4 py-1">
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
type Theme = "system" | "light" | "dark";

function readTheme(): Theme {
  try {
    return (localStorage.getItem("pv_theme") as Theme | null) ?? "system";
  } catch {
    return "system";
  }
}

function setLocaleCookie(l: "en" | "fr") {
  document.cookie = `pv_locale=${l}; path=/; max-age=31536000; samesite=lax`;
}

export function ProfileScreen({ locale, onSignOut }: { locale: "en" | "fr"; onSignOut: () => void }) {
  const { m, t } = useI18n();
  const router = useRouter();
  const snapshot = useApp((s) => s.snapshot);
  const pending = useApp((s) => s.outbox.filter((i) => i.status === "pending").length);
  // Only rendered client-side after the wallet boots, so reading storage here is safe.
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const displayCurrency = useApp((s) => s.displayCurrency);

  useEffect(() => {
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
    setLocaleCookie(l);
    await api("/api/app/profile", { locale: l }).catch(() => {});
    router.push(`/${l}/app`);
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
      <h1 className="text-[22px] font-medium tracking-tight text-ink">{m.profile.title}</h1>
      <Card className="divide-y divide-line py-1">
        {row(m.profile.email, <span className="break-all">{u.email}</span>)}
        {row(m.profile.country, `${u.country} · ${u.currency}`)}
        {row(m.profile.verification, m.vault.tier[u.kycTier])}
        {row(
          m.profile.merchantMode,
          <button onClick={() => setMerchantOpen(true)} className="inline-flex items-center gap-1.5 text-ink underline-offset-4 hover:underline">
            <Store className="h-4 w-4" />
            {u.merchant ? t(m.profile.merchantOn, { name: u.merchant.name }) : m.profile.merchantOff}
          </button>,
        )}
      </Card>
      {snapshot.partner.sandbox && <Notice tone="warn">{m.profile.sandbox}</Notice>}

      <DevicesCard />
      <PhoneCard />

      <Card className="space-y-4">
        {snapshot.fx && (
          <Select
            label={m.profile.showIn}
            value={displayCurrency ?? ""}
            onChange={(e) => void useApp.getState().setDisplayCurrency(e.target.value || null)}
            hint={
              snapshot.fx.source === "live"
                ? t(m.profile.showInHint, { currency: u.currency, date: shortDate(snapshot.fx.asOf * 1000, locale) })
                : t(m.profile.showInRough, { currency: u.currency })
            }
          >
            <option value="">{m.profile.showInOff}</option>
            {snapshot.fx.currencies
              .filter((c) => c !== u.currency)
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </Select>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{m.profile.language}</p>
          <div className="flex gap-2">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => void switchLocale(l)}
                aria-pressed={locale === l}
                className={`h-11 rounded-full px-5 text-sm font-medium ${locale === l ? "bg-brand text-white" : "bg-card-2 text-ink"}`}
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
                className={`h-11 rounded-full px-5 text-sm font-medium ${theme === v ? "bg-brand text-white" : "bg-card-2 text-ink"}`}
              >
                {m.profile.theme[v]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {install && (
        <Button variant="secondary" className="w-full" onClick={() => void install.prompt()}>
          <Download className="h-4 w-4" /> {m.profile.install}
        </Button>
      )}

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
      {snapshot?.user.merchant && <StallSticker merchant={snapshot.user.merchant} />}
    </Sheet>
  );
}

/** Printable QR / NFC tag for the stall: customers pay it even when the trader has no smartphone. */
function StallSticker({ merchant }: { merchant: { id: string; name: string; code: string } }) {
  const { m, locale } = useI18n();
  const url = stickerUrl(location.origin, locale, { merchantId: merchant.id, name: merchant.name });
  const [nfc, setNfc] = useState<string | null>(null);

  const save = async () => {
    const a = document.createElement("a");
    a.href = await QRCode.toDataURL(url, { margin: 2, width: 1024 });
    a.download = `payvault-${merchant.code}.png`;
    a.click();
  };

  const writeTag = async () => {
    try {
      // Web NFC (Android Chrome): writes the same link onto a blank NFC sticker.
      const Reader = (window as unknown as { NDEFReader: new () => { write(m: unknown): Promise<void> } }).NDEFReader;
      setNfc(m.sticker.nfcHold);
      await new Reader().write({ records: [{ recordType: "url", data: url }] });
      setNfc(m.sticker.nfcDone);
    } catch {
      setNfc(m.common.genericError);
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-line pt-5">
      <h3 className="text-[17px] font-medium text-ink">{m.sticker.title}</h3>
      <p className="text-sm text-muted">{m.sticker.hint}</p>
      <QrCode text={url} label={m.sticker.title} />
      <p className="text-center text-sm text-muted">
        {m.sticker.code} <span className="tabular font-medium text-ink">{merchant.code}</span>
      </p>
      <Button variant="secondary" className="w-full" onClick={() => void save()}>
        <Download className="h-4 w-4" /> {m.sticker.save}
      </Button>
      {"NDEFReader" in window && (
        <Button variant="secondary" className="w-full" onClick={() => void writeTag()}>
          <Nfc className="h-4 w-4" /> {m.sticker.nfc}
        </Button>
      )}
      {nfc && <Notice>{nfc}</Notice>}
    </div>
  );
}

/** Basic-phone access: link a number with its own PIN for USSD and SMS. */
function PhoneCard() {
  const { m, t } = useI18n();
  const linked = useApp((s) => s.snapshot?.user.phone ?? null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ code: string }>("/api/app/phone", { phone, pin });
      setCode(res.code);
      setPhone("");
      setPin("");
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <form onSubmit={link} className="space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-ink" />
          <h2 className="text-[17px] font-medium text-ink">{m.phone.title}</h2>
        </div>
        <p className="text-sm text-muted">{linked ? t(m.phone.linked, { phone: linked }) : m.phone.hint}</p>
        {code && (
          <Notice>
            {m.phone.confirm} <span className="tabular font-medium text-ink">{code}</span>
          </Notice>
        )}
        <Field label={m.phone.number} inputMode="tel" placeholder="+2348012345678" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field
          label={m.phone.pin}
          inputMode="numeric"
          type="password"
          autoComplete="off"
          required
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          hint={m.phone.pinHint}
          error={error}
        />
        <Button type="submit" variant="secondary" className="w-full" loading={busy} disabled={!/^[0-9]{4,6}$/.test(pin)}>
          {linked ? m.phone.update : m.phone.link}
        </Button>
      </form>
    </Card>
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
              className={`h-11 rounded-full px-5 text-sm font-medium ${mode === "topup" ? "bg-brand text-white" : "bg-card text-ink"}`}
            >
              {m.add.topUp}
            </button>
          )}
          <button
            onClick={() => setMode("send")}
            className={`h-11 rounded-full px-5 text-sm font-medium ${mode === "send" ? "bg-brand text-white" : "bg-card text-ink"}`}
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

type DeviceSummary = { id: string; label: string; createdAt: string; frozenAt: string | null; vaultOpen: boolean };

/** Lost-phone control: freeze any of your phones from another one, plus the PIN-free limit for this phone. */
function DevicesCard() {
  const { m, t, locale } = useI18n();
  const userId = useApp((s) => s.userId)!;
  const cur = useApp((s) => s.snapshot?.user.currency) ?? "NGN";
  const [devices, setDevices] = useState<DeviceSummary[] | null>(null);
  const [current, setCurrent] = useState<string | undefined>();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noPin, setNoPin] = useState("");

  useEffect(() => {
    void getDeviceKey(userId).then((d) => setCurrent(d.deviceId));
    void getNoPinLimit(userId).then((v) => setNoPin(v ? String(v / 10 ** minorUnitsOf(cur)) : ""));
    api<{ devices: DeviceSummary[] }>("/api/app/devices")
      .then((r) => setDevices(r.devices))
      .catch(() => setDevices(null));
  }, [userId, cur]);

  const freeze = async (id: string) => {
    if (!window.confirm(m.profile.freezeConfirm)) return;
    setBusy(id);
    setError(null);
    try {
      await api("/api/app/devices/freeze", { deviceId: id });
      setDevices((ds) => ds?.map((d) => (d.id === id ? { ...d, frozenAt: new Date().toISOString(), vaultOpen: false } : d)) ?? null);
      await useApp.getState().refresh();
    } catch (err) {
      setError(err instanceof NetworkError ? m.common.needsNetwork : err instanceof ApiError ? err.message : m.common.genericError);
    } finally {
      setBusy(null);
    }
  };

  const saveNoPin = (v: string) => {
    setNoPin(v);
    const minor = v.trim() ? parseMajor(v, cur) : 0;
    if (minor !== null) void setNoPinLimit(userId, minor);
  };

  return (
    <Card className="space-y-4">
      {devices && devices.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{m.profile.devices}</p>
          <ul className="divide-y divide-line">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-ink">
                  <Smartphone className="h-4 w-4 text-muted" />
                  {d.id === current ? m.profile.thisDevice : t(m.profile.otherDevice, { date: shortDate(d.createdAt, locale) })}
                </span>
                {d.frozenAt ? (
                  <span className="text-sm text-muted">{m.profile.frozen}</span>
                ) : (
                  <Button variant="secondary" className="h-9 px-4 text-sm" loading={busy === d.id} onClick={() => void freeze(d.id)}>
                    {m.profile.freeze}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {error && <Notice tone="danger">{error}</Notice>}
        </div>
      )}
      <Field
        label={m.profile.noPin}
        inputMode="decimal"
        value={noPin}
        onChange={(e) => saveNoPin(e.target.value)}
        hint={m.profile.noPinHint}
        placeholder={money(0, cur, locale)}
      />
    </Card>
  );
}

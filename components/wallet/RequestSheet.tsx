"use client";
import { CheckCircle2, ScanLine, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/client/api";
import { money, parseMajor } from "@/lib/client/money";
import { acceptPayment, cancelRequest, getOpenRequest, openRequest, type OpenRequest } from "@/lib/client/offline";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { QrCode } from "./QrCode";
import { Scanner } from "./Scanner";
import { Button, Field, Notice, Sheet } from "./ui";

type Step =
  | { s: "enable" }
  | { s: "amount" }
  | { s: "show"; open: OpenRequest }
  | { s: "scan"; open: OpenRequest }
  | { s: "accepted"; amount: number; currency: string; creditDrawn: number }
  | { s: "rejected"; code: string };

/** Merchant flow: amount → request code → scan customer → verify offline → queue. */
export function RequestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { m, t, locale } = useI18n();
  const userId = useApp((s) => s.userId)!;
  const snapshot = useApp((s) => s.snapshot);
  const merchant = snapshot?.user.merchant ?? null;
  const currency = snapshot?.user.currency ?? "NGN";
  const [step, setStep] = useState<Step>({ s: merchant ? "amount" : "enable" });
  const [amount, setAmount] = useState("");
  const [name, setName] = useState(snapshot?.user.displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const pending = await getOpenRequest(userId);
      if (pending && merchant) setStep({ s: "show", open: pending });
      else setStep({ s: merchant ? "amount" : "enable" });
    })();
  }, [open, userId, merchant]);

  const close = () => {
    setError(null);
    onClose();
  };

  const enable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/app/merchant", { name });
      await useApp.getState().refresh();
      setStep({ s: "amount" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : m.common.needsNetwork);
    } finally {
      setBusy(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const minor = parseMajor(amount, currency);
    if (!minor || !merchant) return;
    const o = await openRequest(userId, merchant.id, merchant.name, minor, currency);
    setStep({ s: "show", open: o });
  };

  const onScan = useCallback(
    async (text: string) => {
      if (!merchant) return;
      try {
        const res = await acceptPayment(userId, merchant.id, text);
        await useApp.getState().reloadLocal();
        if (res.ok) {
          navigator.vibrate?.([30, 40, 30]);
          setStep({ s: "accepted", amount: res.payment.amount, currency: res.cert.currency, creditDrawn: res.creditDrawn });
          void useApp.getState().sync("accepted");
        } else {
          setStep({ s: "rejected", code: res.code });
        }
      } catch {
        setStep({ s: "rejected", code: "bad_payer_signature" });
      }
    },
    [userId, merchant],
  );

  const reasons = m.request.reasons as Record<string, string>;

  return (
    <Sheet open={open} onClose={close} title={m.request.title}>
      {step.s === "enable" && (
        <form onSubmit={enable} className="space-y-4">
          <p className="text-muted">{m.request.enableHint}</p>
          <Field label={m.request.businessName} required maxLength={32} value={name} onChange={(e) => setName(e.target.value)} error={error} />
          <Button type="submit" className="w-full" loading={busy} disabled={!name.trim()}>
            {m.request.enable}
          </Button>
        </form>
      )}

      {step.s === "amount" && (
        <form onSubmit={create} className="space-y-4">
          <Field
            label={m.request.amount}
            inputMode="decimal"
            autoFocus
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={currency}
          />
          <Button type="submit" className="w-full" disabled={!parseMajor(amount, currency)}>
            {m.request.create}
          </Button>
        </form>
      )}

      {step.s === "show" && (
        <div className="space-y-5 text-center">
          <p className="font-display text-3xl font-extrabold tabular text-navy">
            {money(step.open.amount, step.open.currency, locale)}
          </p>
          <QrCode text={step.open.qr} label={m.request.showHint} />
          <p className="text-sm text-muted">{m.request.showHint}</p>
          <Button className="w-full" onClick={() => setStep({ s: "scan", open: step.open })}>
            <ScanLine className="h-5 w-5" /> {m.request.scanPayer}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={async () => {
              await cancelRequest(userId);
              setAmount("");
              setStep({ s: "amount" });
            }}
          >
            {m.common.cancel}
          </Button>
        </div>
      )}

      {step.s === "scan" && (
        <div className="space-y-4">
          <Scanner hint={m.request.scanPayerHint} onResult={(text) => void onScan(text)} />
          <Button variant="ghost" className="w-full" onClick={() => setStep({ s: "show", open: step.open })}>
            {m.common.back}
          </Button>
        </div>
      )}

      {step.s === "accepted" && (
        <div className="space-y-5 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green" />
          <div>
            <p className="font-display text-2xl font-bold text-ink">{m.request.accepted}</p>
            <p className="mt-1 font-display text-3xl font-extrabold tabular text-navy">{money(step.amount, step.currency, locale)}</p>
          </div>
          <Notice tone="success">{m.request.acceptedHint}</Notice>
          {step.creditDrawn > 0 && <Notice>{t(m.request.withOverdraft, { amount: money(step.creditDrawn, step.currency, locale) })}</Notice>}
          <Button
            className="w-full"
            onClick={() => {
              setAmount("");
              setStep({ s: "amount" });
            }}
          >
            {m.request.newRequest}
          </Button>
        </div>
      )}

      {step.s === "rejected" && (
        <div className="space-y-5 text-center">
          <ShieldAlert className="mx-auto h-16 w-16 text-danger" />
          <p className="font-display text-2xl font-bold text-ink">{m.request.rejected}</p>
          <Notice tone="danger">{reasons[step.code] ?? m.common.genericError}</Notice>
          <Button
            className="w-full"
            onClick={async () => {
              const o = await getOpenRequest(userId);
              setStep(o ? { s: "show", open: o } : { s: "amount" });
            }}
          >
            {m.common.retry}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

"use client";
import type { PaymentRequest } from "@payvault/protocol";
import { CheckCircle2, WifiOff } from "lucide-react";
import { useCallback, useState } from "react";
import { money } from "@/lib/client/money";
import { parseQr, payRequest, type PayQuote, quotePayment } from "@/lib/client/offline";
import { checkPin, getDeviceKey } from "@/lib/client/security";
import { useApp } from "@/lib/client/store";
import { useI18n } from "./I18n";
import { PinPad } from "./PinPad";
import { QrCode } from "./QrCode";
import { Scanner } from "./Scanner";
import { Button, Notice, Sheet } from "./ui";

type Step =
  | { s: "scan" }
  | { s: "confirm"; quote: Extract<PayQuote, { ok: true }> }
  | { s: "pin"; quote: Extract<PayQuote, { ok: true }> }
  | { s: "show"; qr: string; amount: number; currency: string; name: string };

/** Payer flow: scan request → confirm → PIN → sign → show payment code. Fully offline. */
export function PaySheet({ open, onClose, onNeedVault }: { open: boolean; onClose: () => void; onNeedVault: () => void }) {
  const { m, t, locale } = useI18n();
  const userId = useApp((s) => s.userId)!;
  const snapshot = useApp((s) => s.snapshot);
  const [step, setStep] = useState<Step>({ s: "scan" });
  const [error, setError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setStep({ s: "scan" });
    setError(null);
    setPinError(null);
    onClose();
  };

  const onScan = useCallback(
    async (text: string) => {
      setError(null);
      let request: PaymentRequest;
      try {
        const scanned = parseQr(text);
        if (scanned.kind !== "request") throw new Error();
        request = scanned.request;
      } catch {
        setError(m.pay.notPayvault);
        setStep({ s: "scan" });
        return;
      }
      const quote = await quotePayment(userId, request);
      if (!quote.ok) {
        const errs = m.pay.errors as Record<string, string>;
        setError(errs[quote.code] ?? m.common.genericError);
        if (quote.code === "no_vault") onNeedVault();
        return;
      }
      setStep({ s: "confirm", quote });
    },
    [userId, m, onNeedVault],
  );

  const approve = async (pin: string, quote: Extract<PayQuote, { ok: true }>) => {
    setBusy(true);
    setPinError(null);
    const check = await checkPin(userId, pin);
    if (!check.ok) {
      setBusy(false);
      setPinError(check.reason === "locked" ? m.pin.locked : t(m.pin.wrong, { n: check.attemptsLeft ?? 0 }));
      return;
    }
    try {
      const device = await getDeviceKey(userId);
      const { qr } = await payRequest(userId, device.keyPair.privateKey, quote.request);
      await useApp.getState().reloadLocal();
      setStep({ s: "show", qr, amount: quote.request.amount, currency: quote.request.currency, name: quote.request.name });
      void useApp.getState().sync("paid");
    } catch (err) {
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError((m.pay.errors as Record<string, string>)[code] ?? m.common.genericError);
      setStep({ s: "scan" });
    } finally {
      setBusy(false);
    }
  };

  const feeBps = snapshot?.partner.creditFeeBps ?? 0;
  const termDays = snapshot?.partner.creditTermDays ?? 14;

  return (
    <Sheet open={open} onClose={close} title={step.s === "show" ? m.pay.showTitle : step.s === "scan" ? m.pay.scanTitle : m.pay.confirmTitle}>
      {step.s === "scan" && (
        <div className="space-y-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <Scanner hint={m.pay.scanHint} onResult={(text) => void onScan(text)} />
        </div>
      )}

      {step.s === "confirm" && (
        <div className="space-y-5">
          <div className="rounded-[28px] bg-card p-5 text-center">
            <p className="text-sm text-muted">{m.pay.to}</p>
            <p className="text-[17px] font-medium text-ink">{step.quote.request.name}</p>
            <p className="mt-4 text-[38px] leading-none font-medium tracking-tight tabular text-ink">
              {money(step.quote.request.amount, step.quote.request.currency, locale)}
            </p>
          </div>
          <dl className="space-y-2 rounded-[28px] bg-card p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{m.pay.fromVault}</dt>
              <dd className="tabular font-medium">{money(step.quote.fromFunded, step.quote.request.currency, locale)}</dd>
            </div>
            {step.quote.fromCredit > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">{m.pay.fromOverdraft}</dt>
                <dd className="tabular font-medium text-warn">{money(step.quote.fromCredit, step.quote.request.currency, locale)}</dd>
              </div>
            )}
          </dl>
          {step.quote.fromCredit > 0 && (
            <Notice tone="warn">
              {t(m.pay.overdraftNote, {
                fee: money(Math.ceil((step.quote.fromCredit * feeBps) / 10_000), step.quote.request.currency, locale),
                days: termDays,
              })}
            </Notice>
          )}
          <Button className="w-full" onClick={() => setStep({ s: "pin", quote: step.quote })}>
            {m.pay.approve}
          </Button>
        </div>
      )}

      {step.s === "pin" && (
        <PinPad title={m.pin.enter} error={pinError} busy={busy} onSubmit={(pin) => void approve(pin, step.quote)} />
      )}

      {step.s === "show" && (
        <div className="space-y-5 text-center">
          <p className="text-[34px] leading-none font-medium tracking-tight tabular text-ink">{money(step.amount, step.currency, locale)}</p>
          <p className="text-sm text-muted">
            {m.pay.to} {step.name}
          </p>
          <QrCode text={step.qr} label={m.pay.showTitle} />
          <p className="flex items-center justify-center gap-2 text-sm text-muted">
            <WifiOff className="h-4 w-4" /> {m.pay.showHint}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-green">
            <CheckCircle2 className="h-4 w-4" /> {m.pay.signedOffline}
          </p>
          <Button className="w-full" onClick={close}>
            {m.common.done}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

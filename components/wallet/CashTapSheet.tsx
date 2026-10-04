"use client";
import { CheckCircle2, CreditCard, Radio, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { money, parseMajor } from "@/lib/client/money";
import { checkPin } from "@/lib/client/security";
import { useApp } from "@/lib/client/store";
import { executeTapPay, getCashTapCard, isWebNfcSupported, type CashTapCard } from "@/lib/client/cashafrica";
import { useI18n } from "./I18n";
import { PinPad } from "./PinPad";
import { Button, Field, Notice, Sheet } from "./ui";

type Mode = "card" | "pay" | "pin" | "tapping" | "success";

export function CashTapSheet({
  open,
  onClose,
  initialMerchantId,
  initialAmount,
}: {
  open: boolean;
  onClose: () => void;
  initialMerchantId?: string;
  initialAmount?: number;
}) {
  const { m, locale } = useI18n();
  const snapshot = useApp((s) => s.snapshot);
  const userId = useApp((s) => s.userId)!;

  const [mode, setMode] = useState<Mode>(initialMerchantId && initialAmount ? "pay" : "card");
  const [card, setCard] = useState<CashTapCard | null>(null);
  const [merchantInput, setMerchantInput] = useState(initialMerchantId ?? "");
  const [amountInput, setAmountInput] = useState(initialAmount ? String(initialAmount) : "");
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{ ref: string; amount: number; currency: string } | null>(null);

  const nfcAvailable = isWebNfcSupported();
  const currency = snapshot?.user.currency ?? "NGN";

  // Reset happens in close(); opening only fetches the card.
  useEffect(() => {
    if (!open) return;
    let live = true;
    getCashTapCard()
      .then((c) => live && setCard(c))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [open]);

  const handleStartPay = () => {
    setError(null);
    setMode("pay");
  };

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const minor = parseMajor(amountInput, currency);
    if (!minor || minor <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (!merchantInput.trim()) {
      setError("Please specify the recipient or merchant ID.");
      return;
    }
    setMode("pin");
  };

  const handleApprovePin = async (pin: string) => {
    setBusy(true);
    setPinError(null);
    const check = await checkPin(userId, pin);
    if (!check.ok) {
      setBusy(false);
      setPinError(check.reason === "locked" ? m.pin.locked : "Incorrect PIN. Try again.");
      return;
    }

    setMode("tapping");
    setBusy(false);
  };

  const triggerTapCompletion = async () => {
    setBusy(true);
    setError(null);
    const minor = parseMajor(amountInput, currency)!;
    try {
      const res = await executeTapPay({
        merchantId: merchantInput.trim(),
        amount: minor,
        transport: nfcAvailable ? "nfc" : "tap_simulate",
      });

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }

      setTxResult({
        ref: res.ref,
        amount: res.amount,
        currency: res.currency,
      });
      setMode("success");
      void useApp.getState().refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tap payment failed");
      setMode("pay");
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setMode(initialMerchantId && initialAmount ? "pay" : "card");
    setMerchantInput(initialMerchantId ?? "");
    setAmountInput(initialAmount ? String(initialAmount) : "");
    setError(null);
    setPinError(null);
    setTxResult(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} title="CashTap • Contactless">
      {mode === "card" && (
        <div className="space-y-6">
          {/* Virtual Contactless Card */}
          <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-tr from-[#0F2027] via-[#203A43] to-[#2C5364] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
                <Radio className="h-4 w-4 animate-pulse text-[#00E5FF]" /> Contactless
              </span>
              <span className="text-xs font-bold tracking-widest text-[#00E5FF]">CASHTAP</span>
            </div>

            <div className="my-7 flex items-center justify-between">
              <CreditCard className="h-8 w-8 text-white/70" />
              <p className="font-mono text-xl tracking-widest text-white drop-shadow">
                {card?.maskedPan ?? "•••• •••• •••• ••••"}
              </p>
            </div>

            <div className="flex items-end justify-between text-xs">
              <div>
                <p className="text-[10px] text-white/60 uppercase">Cardholder</p>
                <p className="font-medium text-white/95">{snapshot?.user.displayName || "PayVault User"}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase">Expires</p>
                <p className="font-mono font-medium text-white/95">{card?.expiry ?? "--/--"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-green" />
              <div>
                <p className="font-medium text-ink">Powered by CashAfrica Infrastructure</p>
                <p className="mt-0.5 text-xs">
                  {nfcAvailable
                    ? "Web NFC is enabled on your device. Hold your phone near a contactless terminal to pay."
                    : "Tap-to-Pay is active with instant tokenized settlement."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2" onClick={handleStartPay}>
              <Zap className="h-4 w-4" /> Tap to Pay Merchant
            </Button>
            <Button variant="ghost" className="w-full" onClick={close}>
              {m.common.close}
            </Button>
          </div>
        </div>
      )}

      {mode === "pay" && (
        <form onSubmit={handleProceedToPin} className="space-y-5">
          {error && <Notice tone="danger">{error}</Notice>}

          <div className="rounded-2xl bg-card p-4 text-center">
            <p className="text-xs text-muted uppercase tracking-wider">Contactless Tap-to-Pay</p>
            <p className="mt-1 text-sm font-medium text-ink">Enter payment details to authorize tap</p>
          </div>

          <Field
            label="Merchant / Recipient ID or Email"
            placeholder="e.g. merchant hex ID, email or UUID"
            required
            value={merchantInput}
            onChange={(e) => setMerchantInput(e.target.value)}
          />

          <Field
            label={m.pay.amount}
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            required
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            hint={currency}
          />

          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setMode("card")}>
              {m.common.back}
            </Button>
            <Button type="submit" className="flex-1" disabled={!merchantInput || !amountInput}>
              {m.common.continue}
            </Button>
          </div>
        </form>
      )}

      {mode === "pin" && (
        <PinPad
          title={m.pin.enter}
          error={pinError}
          busy={busy}
          onSubmit={(pin) => void handleApprovePin(pin)}
        />
      )}

      {mode === "tapping" && (
        <div className="space-y-7 py-4 text-center">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-accent/30" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white shadow-lg">
              <Smartphone className="h-9 w-9 animate-bounce" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-ink">Ready to Tap</h3>
            <p className="mt-1 text-sm text-muted">
              Hold your device near the merchant terminal or phone.
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink tabular">
              {money(parseMajor(amountInput, currency) ?? 0, currency, locale)}
            </p>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2" loading={busy} onClick={() => void triggerTapCompletion()}>
              <Radio className="h-4 w-4" /> Tap Phone Now
            </Button>
            <Button variant="ghost" className="w-full" disabled={busy} onClick={() => setMode("pay")}>
              {m.common.cancel}
            </Button>
          </div>
        </div>
      )}

      {mode === "success" && txResult && (
        <div className="space-y-6 py-2 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green animate-in zoom-in-75 duration-300" />
          <div>
            <h3 className="text-xl font-medium text-ink">Tap Payment Approved</h3>
            <p className="mt-2 text-3xl font-semibold tabular text-ink">
              {money(txResult.amount, txResult.currency, locale)}
            </p>
            <p className="mt-2 text-xs font-mono text-muted">Ref: {txResult.ref}</p>
          </div>

          <Notice tone="success">
            Contactless payment settled via CashAfrica CashTap infrastructure.
          </Notice>

          <Button className="w-full" onClick={close}>
            {m.common.done}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

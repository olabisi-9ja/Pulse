import {
  ArrowDownLeft,
  BadgeCheck,
  BarChart3,
  Check,
  CloudUpload,
  Headset,
  Landmark,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { ReactNode } from "react";
import { QrPattern } from "./QrPattern";

export type VignetteKind =
  | "request"
  | "scan"
  | "sign"
  | "verify"
  | "sync"
  | "lock"
  | "certify"
  | "extend"
  | "loan"
  | "repay"
  | "integrate"
  | "platform"
  | "usage"
  | "support";

/** A small wallet-styled surface, so the visuals read as the real app. */
function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`pv-wallet w-full max-w-[17rem] rounded-[1.5rem] p-4 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.45)] ${className}`}>{children}</div>;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[0.72rem]">
      <span className="text-muted">{label}</span>
      <span className={`tabular ${strong ? "font-medium text-ink" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function Pill({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "muted" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.62rem] font-medium ${
        tone === "accent" ? "bg-accent-soft text-accent-text" : "bg-card text-muted"
      }`}
    >
      {children}
    </span>
  );
}

/** Illustrative product visual for a stacked card. Sample data only; purely decorative. */
export function Vignette({ kind }: { kind: VignetteKind }) {
  switch (kind) {
    case "request":
      return (
        <Screen className="text-center">
          <p className="text-[0.7rem] text-muted">Mama Put</p>
          <p className="tabular mt-1 text-2xl font-medium tracking-tight text-ink">XOF 1,500</p>
          <div className="mx-auto mt-3 w-36 rounded-2xl bg-white p-2 text-[#0b1411]">
            <QrPattern seed={11} className="h-full w-full" />
          </div>
        </Screen>
      );
    case "scan":
      return (
        <Screen className="bg-[#0f1216]!">
          <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-[1.25rem] bg-[#1b2027]">
            <div className="absolute inset-6 rounded-2xl bg-white p-1.5 text-[#0b1411]">
              <QrPattern seed={11} className="h-full w-full" />
            </div>
            <div className="absolute inset-3 rounded-[1rem] border-2 border-white/80" />
            <div className="absolute inset-x-5 top-1/2 h-0.5 bg-[#2fb386] shadow-[0_0_12px_#2fb386]" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-white/70">
            <ScanLine className="h-3.5 w-3.5" /> Scan to pay
          </p>
        </Screen>
      );
    case "sign":
      return (
        <Screen>
          <p className="text-[0.7rem] text-muted">To</p>
          <p className="text-sm font-medium text-ink">Market stall</p>
          <p className="tabular mt-2 text-2xl font-medium tracking-tight text-ink">XOF 1,500</p>
          <div className="mt-3 rounded-2xl bg-card px-3 py-1">
            <Row label="From vault" value="XOF 1,500" />
          </div>
          <div className="mt-4 flex justify-center gap-2.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-accent" />
            ))}
          </div>
          <div className="mt-4 rounded-full bg-accent py-2.5 text-center text-[0.75rem] font-medium text-white">Approve</div>
        </Screen>
      );
    case "verify":
      return (
        <Screen className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent-text">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <p className="mt-2 text-[0.72rem] text-muted">Payment received</p>
          <p className="tabular text-2xl font-medium tracking-tight text-ink">XOF 1,500</p>
          <ul className="mt-3 space-y-1.5 text-left">
            {["Issuer signature", "Payer signature", "Limits and replay"].map((c) => (
              <li key={c} className="flex items-center gap-2 rounded-xl bg-card px-3 py-1.5 text-[0.68rem] text-ink">
                <BadgeCheck className="h-3.5 w-3.5 text-accent-text" /> {c}
              </li>
            ))}
          </ul>
        </Screen>
      );
    case "sync":
      return (
        <Screen>
          <div className="flex items-center gap-2 text-[0.72rem] font-medium text-ink">
            <CloudUpload className="h-4 w-4" /> Back online
          </div>
          <ul className="mt-3 divide-y divide-line rounded-2xl bg-card px-3">
            {[
              ["Market stall", "−1,500"],
              ["Bus fare", "−500"],
              ["Pharmacy", "−3,200"],
            ].map(([n, a]) => (
              <li key={n} className="flex items-center justify-between py-2 text-[0.7rem]">
                <span className="text-ink">{n}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular text-ink">{a}</span>
                  <Pill>
                    <Check className="h-3 w-3" /> Settled
                  </Pill>
                </span>
              </li>
            ))}
          </ul>
        </Screen>
      );
    case "lock":
      return (
        <Screen className="bg-brand! text-white">
          <p className="flex items-center gap-1.5 text-[0.7rem] opacity-70">
            <LockKeyhole className="h-3.5 w-3.5" /> Available offline
          </p>
          <p className="tabular mt-2 text-[1.7rem] leading-none font-medium tracking-tight">XOF 18,000</p>
          <div className="mt-4 flex h-1 overflow-hidden rounded-full bg-white/20">
            <span className="w-[80%] bg-white" />
          </div>
          <div className="mt-3 space-y-1 text-[0.7rem]">
            <div className="flex justify-between">
              <span className="opacity-70">Your money</span>
              <span className="tabular">XOF 18,000</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Expires</span>
              <span>Oct 2</span>
            </div>
          </div>
        </Screen>
      );
    case "certify":
      return (
        <Screen>
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-medium text-ink">Allowance certificate</p>
            <ShieldCheck className="h-4 w-4 text-accent-text" />
          </div>
          <div className="mt-3 rounded-2xl bg-card px-3 py-1">
            <Row label="Device key" value="02c4…e9" />
            <Row label="Cap" value="XOF 18,000" />
            <Row label="Expires" value="72 h" />
          </div>
          <p className="mt-3 break-all font-mono text-[0.58rem] leading-relaxed text-muted">sig 30450221 00d3a1 9f…4c7e 0b</p>
          <div className="mt-2">
            <Pill>
              <BadgeCheck className="h-3 w-3" /> Signed by partner
            </Pill>
          </div>
        </Screen>
      );
    case "extend":
      return (
        <Screen>
          <p className="text-[0.7rem] text-muted">Available offline</p>
          <p className="tabular text-2xl font-medium tracking-tight text-ink">XOF 22,000</p>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-line">
            <span className="w-[72%] bg-brand" />
            <span className="w-[16%] bg-accent" />
          </div>
          <div className="mt-3 rounded-2xl bg-card px-3 py-1">
            <Row label="Your money" value="XOF 18,000" />
            <Row label="Overdraft" value="XOF 4,000" strong />
          </div>
        </Screen>
      );
    case "loan":
      return (
        <Screen>
          <p className="text-[0.72rem] font-medium text-ink">Overdraft</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-card p-3">
              <p className="text-[0.62rem] text-muted">Limit</p>
              <p className="tabular text-sm font-medium text-ink">XOF 4,000</p>
            </div>
            <div className="rounded-2xl bg-card p-3">
              <p className="text-[0.62rem] text-muted">Owed</p>
              <p className="tabular text-sm font-medium text-ink">XOF 2,040</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-card px-3 py-2 text-[0.7rem]">
            <span className="text-ink">Due in 14 days</span>
            <Pill>Open</Pill>
          </div>
        </Screen>
      );
    case "repay":
      return (
        <Screen>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-card text-ink">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-[0.72rem] text-ink">Deposit received</span>
            <span className="tabular text-[0.72rem] font-medium text-green">+XOF 10,000</span>
          </div>
          <div className="mt-3 rounded-2xl bg-card px-3 py-2">
            <div className="flex items-center justify-between text-[0.7rem]">
              <span className="text-ink">Overdraft repaid</span>
              <Pill>
                <Check className="h-3 w-3" /> Repaid
              </Pill>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-accent" />
          </div>
        </Screen>
      );
    case "integrate":
      return (
        <div className="flex w-full max-w-[18rem] items-center justify-between gap-3">
          <Node icon={<ShieldCheck className="h-5 w-5" />} label="PayVault" />
          <div className="relative h-0.5 flex-1 bg-white/40">
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <Node icon={<Landmark className="h-5 w-5" />} label="Your ledger" />
        </div>
      );
    case "platform":
      return (
        <Screen>
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-medium text-ink">Settled offline, 7 days</p>
            <BarChart3 className="h-4 w-4 text-muted" />
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
              <span key={i} className={`flex-1 rounded-t-md ${i === 5 ? "bg-accent" : "bg-brand/80"}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </Screen>
      );
    case "usage":
      return (
        <Screen>
          <div className="flex items-center gap-2 text-[0.72rem] font-medium text-ink">
            <Smartphone className="h-4 w-4" /> Active devices
          </div>
          <p className="tabular mt-2 text-2xl font-medium tracking-tight text-ink">1,284</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <span className="block h-full w-[64%] bg-brand" />
          </div>
          <p className="mt-2 text-[0.62rem] text-muted">Billed per active device or settled transaction</p>
        </Screen>
      );
    case "support":
      return (
        <Screen>
          <div className="flex items-center gap-2 text-[0.72rem] font-medium text-ink">
            <Headset className="h-4 w-4" /> Partner support
          </div>
          <div className="mt-3 space-y-2 text-[0.68rem]">
            <p className="w-4/5 rounded-2xl rounded-bl-md bg-card px-3 py-2 text-ink">Risk review for the Lagos pilot is ready.</p>
            <p className="ml-auto w-3/5 rounded-2xl rounded-br-md bg-brand px-3 py-2 text-white">Thanks, reviewing now.</p>
          </div>
        </Screen>
      );
  }
}

function Node({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#14365a] shadow-lg">{icon}</span>
      <span className="text-[0.7rem] font-medium text-white/80">{label}</span>
    </div>
  );
}

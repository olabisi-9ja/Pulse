import { ArrowUpRight, Battery, QrCode, ScanLine, ShieldCheck, WifiOff } from "lucide-react";
import type { SiteMessages } from "@/messages/site";

/** HTML/CSS wallet screen used as the product visual. All figures are sample data. */
export function PhoneMockup({ t, className = "" }: { t: SiteMessages["mock"]; className?: string }) {
  return (
    <figure className={`mx-auto w-full max-w-[19rem] ${className}`}>
      <div className="rounded-[2.75rem] border border-line bg-ink p-2.5 shadow-2xl shadow-navy/20">
        <div className="overflow-hidden rounded-[2.25rem] bg-paper">
          <div className="flex items-center justify-between px-6 pt-4 text-[0.7rem] font-semibold text-ink">
            <span className="tabular">09:12</span>
            <span className="flex items-center gap-1.5 text-muted">
              <WifiOff className="h-3.5 w-3.5" aria-hidden />
              <Battery className="h-4 w-4" aria-hidden />
            </span>
          </div>

          <div className="space-y-3 px-4 pb-5 pt-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-extrabold text-navy">{t.greeting}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-[0.65rem] font-bold text-warn">
                <WifiOff className="h-3 w-3" aria-hidden />
                {t.offline}
              </span>
            </div>

            <div className="rounded-3xl bg-navy p-4 text-on-accent">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold opacity-80">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {t.vaultNote}
              </p>
              <p className="tabular mt-2 font-display text-3xl font-extrabold">
                <span className="mr-1.5 text-base font-bold opacity-80">{t.currency}</span>
                {t.vaultAmount}
              </p>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-on-accent/15 px-3 py-2">
                <div>
                  <p className="text-[0.65rem] font-semibold opacity-80">{t.overdraft}</p>
                  <p className="text-[0.6rem] opacity-70">{t.overdraftNote}</p>
                </div>
                <p className="tabular whitespace-nowrap text-sm font-extrabold">
                  {t.currency} {t.overdraftAmount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <span className="flex items-center justify-center gap-2 rounded-full bg-green py-3 text-xs font-bold text-on-accent">
                <ScanLine className="h-4 w-4" aria-hidden />
                {t.pay}
              </span>
              <span className="flex items-center justify-center gap-2 rounded-full border border-line bg-card py-3 text-xs font-bold text-navy">
                <QrCode className="h-4 w-4" aria-hidden />
                {t.request}
              </span>
            </div>

            <div className="rounded-3xl border border-line bg-card p-3.5">
              <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wider text-muted">{t.recent}</p>
              <ul className="divide-y divide-line">
                {t.payments.map((p) => (
                  <li key={p.name} className="flex items-center gap-3 py-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-soft text-green">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{p.name}</span>
                      <span className="block truncate text-[0.65rem] text-muted">{p.meta}</span>
                    </span>
                    <span className="tabular text-xs font-bold text-ink">{p.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">{t.caption}</figcaption>
    </figure>
  );
}

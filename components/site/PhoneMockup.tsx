import { ArrowDownLeft, ArrowUpRight, BatteryFull, CircleUser, Eye, Home, LockKeyhole, ReceiptText, ScanLine, WifiOff } from "lucide-react";
import type { SiteMessages } from "@/messages/site";

/**
 * Scaled replica of the wallet PWA's Home screen at a real phone ratio (393 × 852), built from the same tokens
 * (`.pv-wallet`) and layout as components/wallet/HomeScreen.tsx. Sample data only.
 */
export function PhoneMockup({ t, className = "", bare = false }: { t: SiteMessages["mock"]; className?: string; bare?: boolean }) {
  const s = t.screen;
  return (
    <figure className={`mx-auto w-full ${bare ? "" : "max-w-[20rem]"} ${className}`}>
      <div className="rounded-[3rem] bg-[#0f1216] p-[0.6rem] shadow-[0_40px_80px_-30px_rgb(20_54_90/0.45)] ring-1 ring-black/5">
        <div className="pv-wallet relative aspect-[393/852] overflow-hidden rounded-[2.5rem]" aria-hidden>
          {/* Status bar */}
          <div className="relative flex items-center justify-between px-7 pt-3.5 pb-1 text-[0.72rem] font-semibold text-ink">
            <span className="tabular">9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[1.35rem] w-[5.5rem] -translate-x-1/2 rounded-full bg-[#0f1216]" />
            <span className="flex items-center gap-1.5">
              <WifiOff className="h-3.5 w-3.5" />
              <BatteryFull className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-4 px-4 pt-3 pb-24">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[0.72rem] font-medium text-white">{s.initials}</span>
              <p className="min-w-0 flex-1 truncate text-[0.9rem] font-medium text-ink">{s.hello}</p>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink shadow-[var(--pv-shadow)] ring-1 ring-line">
                <ScanLine className="h-4 w-4" />
              </span>
            </div>

            {/* Balance card */}
            <div className="rounded-[1.4rem] bg-brand p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-[0.68rem] opacity-70">{s.balance}</p>
                <span className="rounded-full bg-accent px-3.5 py-1.5 text-[0.7rem] font-medium text-white">{s.topUp}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="tabular text-[1.55rem] leading-tight font-medium tracking-tight">{s.balanceAmount}</p>
                <Eye className="h-3.5 w-3.5 opacity-80" />
              </div>
              <div className="mt-5 flex gap-2">
                <span className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[0.75rem] font-medium text-brand">
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  {s.request}
                </span>
                <span className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[0.75rem] font-medium text-brand">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {s.pay}
                </span>
              </div>
            </div>

            {/* Offline vault */}
            <div className="space-y-2">
              <p className="text-[0.8rem] font-medium text-ink">{s.vault}</p>
              <div className="rounded-[1.25rem] bg-card p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="tabular text-[1.05rem] font-medium text-ink">{s.vaultAmount}</p>
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.62rem] font-medium text-accent-text">{s.ready}</span>
                </div>
                <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-line">
                  <span className="w-[62%] bg-brand" />
                  <span className="w-[18%] bg-accent" />
                </div>
                <p className="mt-2 text-[0.62rem] text-muted">{s.expires}</p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[0.8rem] font-medium text-ink">{s.activity}</p>
                <p className="text-[0.68rem] text-ink">{s.seeAll}</p>
              </div>
              <ul className="divide-y divide-line rounded-[1.25rem] bg-card px-3">
                {s.rows.map((r) => (
                  <li key={r.title} className="flex items-center gap-2.5 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-ink">
                      {r.incoming ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.72rem] font-medium text-ink">{r.title}</span>
                      <span className="block truncate text-[0.6rem] text-muted">{r.date}</span>
                    </span>
                    <span className="flex flex-col items-end gap-0.5">
                      <span className={`tabular text-[0.72rem] font-medium ${r.incoming ? "text-green" : "text-ink"}`}>{r.amount}</span>
                      {r.pending && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.55rem] font-medium text-accent-text">{r.pending}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Floating pill nav, as in the app */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <div className="flex items-center gap-0.5 rounded-full bg-paper p-1 shadow-[var(--pv-shadow)] ring-1 ring-line">
              <span className="flex h-10 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[0.7rem] font-medium text-white">
                <Home className="h-3.5 w-3.5" />
                {s.home}
              </span>
              {[ReceiptText, LockKeyhole, CircleUser].map((Icon, i) => (
                <span key={i} className="grid h-10 w-10 place-items-center text-muted">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {!bare && <figcaption className="mt-4 text-center text-xs text-muted">{t.caption}</figcaption>}
    </figure>
  );
}

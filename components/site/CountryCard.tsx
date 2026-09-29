import { Banknote, Landmark, ShieldCheck } from "lucide-react";
import { formatMinor, type CountryPack } from "@payvault/countries";
import type { Locale } from "@/lib/i18n";
import type { SiteMessages } from "@/messages/site";
import { Pill } from "./ui";

export function CountryCard({ pack, locale, t }: { pack: CountryPack; locale: Locale; t: SiteMessages["coverage"] }) {
  const c = t.card;
  const statusLabel = t.status[pack.status];
  const rails = pack.rails.domestic;
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-medium text-navy">{pack.name[locale]}</h3>
          <p className="mt-0.5 text-xs text-muted">
            <span className="tabular font-semibold">{pack.code}</span>
            {pack.bloc && <> · {pack.bloc}</>}
          </p>
        </div>
        <Pill tone={pack.status === "concept" ? "warn" : "green"}>{statusLabel}</Pill>
      </header>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-start gap-2.5">
          <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden />
          <div>
            <dt className="sr-only">{c.currency}</dt>
            <dd>
              <span className="font-semibold text-ink">{pack.currency.name[locale]}</span>{" "}
              <span className="text-muted">({pack.currency.code})</span>
            </dd>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-card-2 p-3">
          <div>
            <dt className="text-xs text-muted">{c.perTransaction}</dt>
            <dd className="tabular font-semibold text-ink">
              {formatMinor(pack.offlineLimits.perTransaction, pack.currency.code, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{c.allowanceCap}</dt>
            <dd className="tabular font-semibold text-ink">
              {formatMinor(pack.offlineLimits.allowanceCap, pack.currency.code, locale)}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden />
          <div>
            <dt className="text-xs text-muted">{c.rails}</dt>
            <dd className="text-ink">
              {rails.map((r) => r.name).join(", ")}
              {pack.rails.crossBorder.includes("papss") && (
                <span className="mt-1 block text-xs font-semibold text-green">{c.papssYes}</span>
              )}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden />
          <div>
            <dt className="text-xs text-muted">{c.dataLaw}</dt>
            <dd className="text-ink">
              {pack.dataProtection.authority}
              <span className="block text-xs text-muted">{c.residency[pack.dataProtection.residency]}</span>
            </dd>
          </div>
        </div>
      </dl>
    </article>
  );
}

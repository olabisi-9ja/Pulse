import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, MoneyList, PageHeader } from "@/components/console/ui";
import { first, pageContext } from "@/lib/console/context";
import { duration, money, num, pct } from "@/lib/console/format";
import { metrics } from "@/lib/console/queries";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = { title: "Pilot metrics" };

const WINDOWS = [7, 30, 90] as const;

function Metric({ title, def, children, definitionLabel }: { title: string; def: string; children: React.ReactNode; definitionLabel: string }) {
  return (
    <Card title={title}>
      <div className="min-h-16">{children}</div>
      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        <span className="font-semibold text-ink">{definitionLabel}. </span>
        {def}
      </p>
    </Card>
  );
}

export default async function MetricsPage(props: PageProps<"/[locale]/console/metrics">) {
  const { ctx, sp } = await pageContext(props);
  const { t, locale } = ctx;
  const m = t.metrics;
  const asked = Number(first(sp.days));
  const days = (WINDOWS as readonly number[]).includes(asked) ? asked : 30;
  const d = await metrics(ctx.partnerId, days);
  const big = "font-display text-3xl font-bold text-ink";
  const none = <p className="text-sm text-muted">{m.noPaymentsWindow}</p>;
  const channel = (k: "courier" | "merchant" | "payer" | "api") => ({
    label: m[k],
    n: d.via[k] ?? 0,
  });
  const channels = [channel("courier"), channel("merchant"), channel("payer"), channel("api")];

  return (
    <>
      <PageHeader
        title={m.title}
        subtitle={m.subtitle}
        actions={
          <nav aria-label={m.window} className="flex gap-1 rounded-xl border border-line bg-card p-1">
            {WINDOWS.map((w) => (
              <Link
                key={w}
                href={ctx.href("/metrics", { days: w })}
                aria-current={w === days ? "true" : undefined}
                className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold ${
                  w === days ? "bg-green text-on-accent" : "text-ink hover:bg-card-2"
                }`}
              >
                {fmt(t.common.days, { n: w })}
              </Link>
            ))}
          </nav>
        }
      />
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone="green">{t.common.measured}</Badge>
        {fmt(m.lastDays, { n: days })}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Metric title={m.payments} def={m.paymentsDef} definitionLabel={t.common.definition}>
          <p className={`tabular ${big}`}>{num(d.payments, locale)}</p>
        </Metric>

        <Metric title={m.channels} def={m.channelsDef} definitionLabel={t.common.definition}>
          {d.payments === 0 ? (
            none
          ) : (
            <ul className="space-y-2">
              {channels.map((c) => (
                <li key={c.label}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-ink">{c.label}</span>
                    <span className="tabular text-muted">
                      {num(c.n, locale)} · {pct(c.n / d.payments, locale)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-card-2" aria-hidden>
                    <div className="h-full rounded-full bg-green" style={{ width: `${(c.n / d.payments) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Metric>

        <Metric title={m.settleTime} def={m.settleTimeDef} definitionLabel={t.common.definition}>
          {d.settle.n === 0 || d.settle.median === null || d.settle.p90 === null ? (
            none
          ) : (
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{m.median}</p>
                <p className={`tabular ${big}`}>{duration(d.settle.median, locale)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{m.p90}</p>
                <p className={`tabular ${big}`}>{duration(d.settle.p90, locale)}</p>
              </div>
            </div>
          )}
        </Metric>

        <Metric title={m.duplicates} def={m.duplicatesDef} definitionLabel={t.common.definition}>
          <Badge tone="neutral">{m.notTracked}</Badge>
        </Metric>

        <Metric title={m.forkRate} def={m.forkRateDef} definitionLabel={t.common.definition}>
          {d.payments === 0 ? (
            none
          ) : (
            <>
              <p className={`tabular ${big}`}>{num((d.cases.total / d.payments) * 10_000, locale, { maximumFractionDigits: 1 })}</p>
              <p className="mt-1 text-xs text-muted">
                {m.per10k} · {fmt(m.fraudCases, { n: d.cases.total, forks: d.cases.forks })}
              </p>
            </>
          )}
        </Metric>

        <Metric title={m.lossRate} def={m.lossRateDef} definitionLabel={t.common.definition}>
          {d.loss.length === 0 || d.payments === 0 ? (
            none
          ) : (
            <ul className="space-y-1">
              {d.loss.map((l) => (
                <li key={l.currency} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`tabular ${l.volume ? "text-2xl" : ""} font-display font-bold text-ink`}>
                    {l.volume ? pct(l.loss / l.volume, locale) : "–"}
                  </span>
                  <span className="tabular text-xs text-muted">
                    {money(l.loss, l.currency, locale)} / {money(l.volume, l.currency, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Metric>

        <Metric title={m.overdraftDrawn} def={m.overdraftDrawnDef} definitionLabel={t.common.definition}>
          {d.drawn.length === 0 ? (
            <p className="text-sm text-muted">{m.noLoansDrawn}</p>
          ) : (
            <div className={`tabular ${big}`}>
              <MoneyList items={d.drawn} locale={locale} />
            </div>
          )}
        </Metric>

        <Metric title={m.repayRate} def={m.repayRateDef} definitionLabel={t.common.definition}>
          {d.due.due === 0 ? (
            <p className="text-sm text-muted">{m.noLoansDue}</p>
          ) : (
            <>
              <p className={`tabular ${big}`}>{pct(d.due.repaid / d.due.due, locale)}</p>
              <p className="mt-1 text-xs text-muted">{fmt(m.dueLoans, { repaid: d.due.repaid, due: d.due.due })}</p>
            </>
          )}
        </Metric>

        <div className="lg:col-span-2">
          <Metric title={m.reconciliation} def={m.reconciliationDef} definitionLabel={t.common.definition}>
            {d.payments === 0 ? (
              none
            ) : (
              <div className="flex gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{m.gapAllowances}</p>
                  <p className={`tabular ${big} ${d.gaps.allowances ? "text-warn" : ""}`}>{num(d.gaps.allowances, locale)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{m.gapPayments}</p>
                  <p className={`tabular ${big}`}>{num(d.gaps.payments, locale)}</p>
                </div>
              </div>
            )}
          </Metric>
        </div>
      </div>
    </>
  );
}

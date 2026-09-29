import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card, DataTable, Empty, Kpi, MoneyList, PageHeader, Td, btnSecondary } from "@/components/console/ui";
import { pageContext } from "@/lib/console/context";
import { dateTime, num, short } from "@/lib/console/format";
import { overview } from "@/lib/console/queries";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = { title: "Overview" };

function summarize(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? short(v, 12) : v}`)
    .join(" · ");
}

export default async function OverviewPage(props: PageProps<"/[locale]/console">) {
  const { ctx } = await pageContext(props);
  const { t, locale } = ctx;
  const o = await overview(ctx.partnerId);
  const fresh = o.totalVaults === 0 && o.events.length === 0;

  return (
    <>
      <PageHeader title={t.overview.title} subtitle={`${ctx.membership.partnerName} · ${t.overview.subtitle}`} />
      {fresh && (
        <div className="mb-6 rounded-2xl border border-line bg-green-soft p-5">
          <h2 className="font-display text-lg font-bold text-ink">{t.overview.emptyTitle}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t.overview.emptyBody}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={ctx.href("/developers")} className={btnSecondary}>
              {t.nav.developers}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={`/${locale}/docs`} className={btnSecondary}>
              {t.overview.viewDocs}
            </Link>
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label={t.overview.activeVaults} hint={t.overview.activeVaultsHint}>
          {num(o.activeVaults, locale)}
        </Kpi>
        <Kpi label={t.overview.exposure} hint={t.overview.exposureHint}>
          <MoneyList items={o.exposure} locale={locale} />
        </Kpi>
        <Kpi label={t.overview.overdraft} hint={t.overview.overdraftHint}>
          <MoneyList items={o.overdraft} locale={locale} />
        </Kpi>
        <Kpi label={t.overview.settled24} hint={fmt(t.overview.settledHint, { n: num(o.settled24.count, locale) })}>
          <MoneyList items={o.settled24.totals} locale={locale} />
        </Kpi>
        <Kpi label={t.overview.settled7} hint={fmt(t.overview.settledHint, { n: num(o.settled7.count, locale) })}>
          <MoneyList items={o.settled7.totals} locale={locale} />
        </Kpi>
        <Kpi label={t.overview.openCases} hint={t.overview.openCasesHint}>
          <Link href={ctx.href("/risk")} className={o.openCases > 0 ? "text-danger" : ""}>
            {num(o.openCases, locale)}
          </Link>
        </Kpi>
        <Kpi label={t.overview.riskLoss} hint={t.overview.riskLossHint}>
          <MoneyList items={o.riskLoss} locale={locale} />
        </Kpi>
      </div>

      <Card title={t.overview.recentEvents} className="mt-6" flush>
        {o.events.length === 0 ? (
          <Empty title={t.overview.noEvents} body={t.overview.noEventsHint} />
        ) : (
          <DataTable
            label={t.overview.recentEvents}
            head={[t.overview.eventCols.time, t.overview.eventCols.type, t.overview.eventCols.detail, t.overview.eventCols.delivery]}
          >
            {o.events.map((e) => (
              <tr key={e.id}>
                <Td>{dateTime(e.created_at, locale)}</Td>
                <Td>
                  <code className="font-mono text-xs">{e.type}</code>
                </Td>
                <Td className="max-w-md truncate text-muted">{summarize(e.payload)}</Td>
                <Td>
                  <Badge tone={e.delivered_at ? "green" : "neutral"}>{e.delivered_at ? t.overview.delivered : t.overview.pending}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </>
  );
}

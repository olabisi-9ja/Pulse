import type { Metadata } from "next";
import Link from "next/link";
import { ApiForm } from "@/components/console/ApiForm";
import { Card, DataTable, Empty, Kpi, Mono, MoneyList, PageHeader, Status, Td, inputCls } from "@/components/console/ui";
import { pageContext } from "@/lib/console/context";
import { dateTime, money, num, short } from "@/lib/console/format";
import { listFraud } from "@/lib/console/queries";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = { title: "Risk & fraud" };

export default async function RiskPage(props: PageProps<"/[locale]/console/risk">) {
  const { ctx } = await pageContext(props);
  const { t, locale } = ctx;
  const r = t.risk;
  const f = await listFraud(ctx.partnerId);

  return (
    <>
      <PageHeader title={r.title} subtitle={r.subtitle} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Kpi label={t.overview.openCases}>{num(f.open, locale)}</Kpi>
        <Kpi label={r.lossTotal}>
          <MoneyList items={f.loss} locale={locale} />
        </Kpi>
      </div>
      <Card flush>
        {f.rows.length === 0 ? (
          <Empty title={r.emptyTitle} body={r.emptyBody} />
        ) : (
          <DataTable label={r.title} head={[r.cols.kind, r.cols.allowance, r.cols.seq, r.cols.payments, r.cols.loss, r.cols.status, r.cols.opened, r.cols.actions]}>
            {f.rows.map((c) => (
              <tr key={c.id} className="align-top">
                <Td className="font-semibold">{t.labels.fraudKind[c.kind] ?? c.kind}</Td>
                <Td>
                  <Link href={ctx.href(`/allowances/${c.allowance_id}`)} className="font-semibold text-green hover:underline">
                    <Mono>{short(c.allowance_id, 10)}</Mono>
                  </Link>
                </Td>
                <Td num>{c.seq ?? "–"}</Td>
                <Td className="whitespace-normal">
                  <div className="min-w-56 space-y-1 text-xs text-muted">
                    {c.payment_ids.length === 0 ? (
                      <p>{r.noEvidence}</p>
                    ) : (
                      <>
                        <p>{c.kind === "fork" && c.payment_ids.length > 1 ? fmt(r.evidenceFork, { seq: c.seq ?? "?" }) : r.evidenceOne}</p>
                        {c.payment_ids.map((p) => (
                          <p key={p}>
                            <Mono>{p}</Mono>
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                </Td>
                <Td num>{money(c.loss, c.currency, locale)}</Td>
                <Td>
                  <Status value={c.status} labels={t.labels.fraudStatus} />
                </Td>
                <Td>{dateTime(c.created_at, locale)}</Td>
                <Td>
                  {ctx.canWrite ? (
                    <ApiForm
                      endpoint="/api/console/risk/status"
                      fixed={{ partnerId: ctx.partnerId, id: c.id }}
                      submitLabel={r.setStatus}
                      pendingLabel={t.common.saving}
                      variant="secondary"
                      inline
                    >
                      <select name="status" defaultValue={c.status} aria-label={r.setStatus} className={`${inputCls} w-40`}>
                        {Object.entries(t.labels.fraudStatus).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </ApiForm>
                  ) : (
                    <span className="text-xs text-muted">{t.common.readOnly.split(".")[0]}</span>
                  )}
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </>
  );
}

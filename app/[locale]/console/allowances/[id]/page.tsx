import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { ApiForm } from "@/components/console/ApiForm";
import { Card, DataTable, DefList, Empty, Mono, PageHeader, ReadOnlyNote, Status, Td, Field, inputCls } from "@/components/console/ui";
import { pageContext } from "@/lib/console/context";
import { dateTime, money, num, short } from "@/lib/console/format";
import { allowanceDetail } from "@/lib/console/queries";
import { fmt } from "@/lib/i18n";

export const metadata: Metadata = { title: "Allowance" };

export default async function AllowanceDetailPage(props: PageProps<"/[locale]/console/allowances/[id]">) {
  const { id } = await props.params;
  const { ctx } = await pageContext({ params: props.params, searchParams: props.searchParams });
  const { t, locale } = ctx;
  const d = t.allowances.detail;
  const data = await allowanceDetail(ctx.partnerId, id);

  const back = (
    <Link href={ctx.href("/allowances")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {t.nav.allowances}
    </Link>
  );

  if (!data) {
    return (
      <>
        {back}
        <Card>
          <Empty title={d.notFound} />
        </Card>
      </>
    );
  }

  const { allowance: a, chain, fraud } = data;
  const cur = a.currency;
  const m = (n: number) => money(n, cur, locale);
  const maxSeq = chain.reduce((x, r) => Math.max(x, r.seq), 0);
  const gap = a.payments_count < maxSeq;
  const remaining = Math.max(0, a.funded + a.credit - a.settled_funded - a.settled_credit);

  return (
    <>
      {back}
      <PageHeader
        title={`${t.allowances.cols.id} ${short(a.id, 10)}`}
        subtitle={a.external_ref ?? undefined}
        actions={<Status value={a.status} labels={t.labels.allowanceStatus} />}
      />

      {gap && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-sm text-warn">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fmt(d.gap, { count: a.payments_count, max: maxSeq })}
        </p>
      )}

      <div className="grid gap-4">
        <Card title={d.certificate}>
          <DefList
            items={[
              { label: d.fields.id, value: <Mono>{a.id}</Mono> },
              { label: d.fields.externalRef, value: a.external_ref ?? "–" },
              { label: d.fields.holder, value: a.holder ?? "–" },
              { label: d.fields.issuerKid, value: a.issuer_kid },
              { label: d.fields.country, value: a.country },
              { label: d.fields.currency, value: a.currency },
              { label: d.fields.funded, value: m(a.funded) },
              { label: d.fields.credit, value: m(a.credit) },
              { label: d.fields.perTx, value: m(a.per_tx_limit) },
              { label: d.fields.maxPayments, value: num(a.max_payments, locale) },
              { label: d.fields.issuedAt, value: dateTime(a.issued_at, locale) },
              { label: d.fields.expiresAt, value: dateTime(a.expires_at, locale) },
              ...(a.closed_at ? [{ label: d.fields.closedAt, value: dateTime(a.closed_at, locale) }] : []),
              ...(a.declared_seq !== null
                ? [{ label: d.fields.declared, value: `#${a.declared_seq} · ${m(a.declared_cumulative ?? 0)}` }]
                : []),
              { label: d.fields.device, value: <Mono>{short(a.device_public_key, 20)}</Mono> },
            ]}
          />
        </Card>

        <Card title={d.settlement}>
          <DefList
            items={[
              { label: d.split.settledFunded, value: m(a.settled_funded) },
              { label: d.split.settledCredit, value: m(a.settled_credit) },
              { label: d.split.loss, value: <span className={a.settled_loss > 0 ? "font-semibold text-danger" : ""}>{m(a.settled_loss)}</span> },
              { label: d.split.refunded, value: m(a.refunded) },
              { label: d.split.paymentsCount, value: num(a.payments_count, locale) },
              { label: d.split.remaining, value: m(a.status === "active" ? remaining : 0) },
            ]}
          />
        </Card>

        <Card title={d.chain} flush>
          {chain.length === 0 ? (
            <Empty title={d.noPayments} />
          ) : (
            <DataTable
              label={d.chain}
              head={[d.chainCols.seq, d.chainCols.id, d.chainCols.amount, d.chainCols.cumulative, d.chainCols.split, d.chainCols.via, d.chainCols.deviceTime, d.chainCols.receivedAt, d.chainCols.status]}
            >
              {chain.map((p) => (
                <tr key={p.id}>
                  <Td num>{p.seq}</Td>
                  <Td>
                    <Mono>{short(p.id, 10)}</Mono>
                  </Td>
                  <Td num>{m(p.amount)}</Td>
                  <Td num>{m(p.cumulative)}</Td>
                  <Td className="tabular text-xs text-muted">
                    {m(p.from_funded)} / {m(p.from_credit)} / {m(p.from_risk_pool)}
                  </Td>
                  <Td>{t.labels.via[p.received_via] ?? p.received_via}</Td>
                  <Td>{dateTime(p.device_time, locale)}</Td>
                  <Td>{dateTime(p.received_at, locale)}</Td>
                  <Td>
                    <Status value={p.status} labels={t.labels.paymentStatus} />
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>

        <Card title={d.fraud} flush={fraud.length > 0}>
          {fraud.length === 0 ? (
            <p className="text-sm text-muted">{d.noFraud}</p>
          ) : (
            <DataTable label={d.fraud} head={[t.risk.cols.kind, t.risk.cols.seq, t.risk.cols.payments, t.risk.cols.loss, t.risk.cols.status, t.risk.cols.opened]}>
              {fraud.map((f) => (
                <tr key={f.id}>
                  <Td>{t.labels.fraudKind[f.kind] ?? f.kind}</Td>
                  <Td num>{f.seq ?? "–"}</Td>
                  <Td>
                    {f.payment_ids.length ? f.payment_ids.map((p) => <Mono key={p}>{short(p, 10)}</Mono>).reduce<React.ReactNode[]>((acc, x, i) => (i ? [...acc, " ", x] : [x]), []) : "–"}
                  </Td>
                  <Td num>{m(f.loss)}</Td>
                  <Td>
                    <Status value={f.status} labels={t.labels.fraudStatus} />
                  </Td>
                  <Td>{dateTime(f.created_at, locale)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>

        {a.status !== "revoked" && (
          <Card title={d.revoke}>
            {ctx.canWrite ? (
              <ApiForm
                endpoint="/api/console/allowances/revoke"
                fixed={{ partnerId: ctx.partnerId, id: a.id }}
                submitLabel={d.revoke}
                pendingLabel={t.common.saving}
                variant="danger"
                confirm={d.revokeConfirm}
                inline
              >
                <Field label={d.revokeReason}>
                  <input name="reason" defaultValue={d.revokeReasonDefault} maxLength={100} required className={`${inputCls} sm:w-72`} />
                </Field>
              </ApiForm>
            ) : (
              <ReadOnlyNote>{t.common.readOnly}</ReadOnlyNote>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

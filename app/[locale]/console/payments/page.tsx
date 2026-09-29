import type { Metadata } from "next";
import Link from "next/link";
import { Card, DataTable, Empty, FilterForm, FilterSelect, Mono, PageHeader, Pager, Status, Td } from "@/components/console/ui";
import { first, pageContext } from "@/lib/console/context";
import { dateTime, money, num, short } from "@/lib/console/format";
import { listPayments, toPage } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Payments" };

const VIA = ["merchant", "payer", "api", "courier"];

export default async function PaymentsPage(props: PageProps<"/[locale]/console/payments">) {
  const { ctx, sp } = await pageContext(props);
  const { t, locale } = ctx;
  const status = ["settled", "flagged"].includes(first(sp.status) ?? "") ? first(sp.status) : undefined;
  const via = VIA.includes(first(sp.via) ?? "") ? first(sp.via) : undefined;
  const list = await listPayments(ctx.partnerId, { status, via, page: toPage(first(sp.page)) });
  const filtered = !!(status || via);
  const c = t.payments.cols;

  return (
    <>
      <PageHeader title={t.payments.title} subtitle={t.payments.subtitle} />
      <Card flush className="pb-0">
        <FilterForm partnerId={ctx.partnerId} showPartner={ctx.memberships.length > 1} t={t.common}>
          <FilterSelect
            name="status"
            label={t.common.status}
            value={status}
            all={t.common.all}
            options={["settled", "flagged"].map((s) => ({ value: s, label: t.labels.paymentStatus[s] }))}
          />
          <FilterSelect
            name="via"
            label={c.via}
            value={via}
            all={t.common.all}
            options={VIA.map((s) => ({ value: s, label: t.labels.via[s] }))}
          />
        </FilterForm>
        <div className="mt-4">
          {list.total === 0 ? (
            <Empty
              title={filtered ? t.payments.noMatch : t.payments.emptyTitle}
              body={filtered ? undefined : t.payments.emptyBody}
              action={filtered ? <Link href={ctx.href("/payments")} className="text-sm font-semibold text-green underline">{t.common.reset}</Link> : undefined}
            />
          ) : (
            <>
              <DataTable label={t.payments.title} head={[c.id, c.allowance, c.seq, c.amount, c.split, c.via, c.deviceTime, c.receivedAt, c.status]}>
                {list.rows.map((p) => (
                  <tr key={p.id} className="hover:bg-card-2">
                    <Td>
                      <Mono>{short(p.id, 10)}</Mono>
                    </Td>
                    <Td>
                      <Link href={ctx.href(`/allowances/${p.allowance_id}`)} className="font-semibold text-green hover:underline">
                        <Mono>{short(p.allowance_id, 10)}</Mono>
                      </Link>
                    </Td>
                    <Td num>{num(p.seq, locale)}</Td>
                    <Td num>{money(p.amount, p.currency, locale)}</Td>
                    <Td className="tabular text-xs text-muted">
                      {[
                        p.from_funded > 0 && `${money(p.from_funded, p.currency, locale)} ${t.payments.splitFunded}`,
                        p.from_credit > 0 && `${money(p.from_credit, p.currency, locale)} ${t.payments.splitCredit}`,
                        p.from_risk_pool > 0 && `${money(p.from_risk_pool, p.currency, locale)} ${t.payments.splitRisk}`,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "–"}
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
              <Pager page={list.page} pages={list.pages} total={list.total} t={t.common} hrefFor={(n) => ctx.href("/payments", { status, via, page: n })} />
            </>
          )}
        </div>
      </Card>
    </>
  );
}

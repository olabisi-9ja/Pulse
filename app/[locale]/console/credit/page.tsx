import type { Metadata } from "next";
import Link from "next/link";
import { ApiForm } from "@/components/console/ApiForm";
import {
  Card,
  DataTable,
  Empty,
  Field,
  FilterForm,
  FilterSelect,
  Kpi,
  Mono,
  MoneyList,
  PageHeader,
  Pager,
  ReadOnlyNote,
  Status,
  Td,
  inputCls,
} from "@/components/console/ui";
import { first, pageContext } from "@/lib/console/context";
import { dateOnly, money, short } from "@/lib/console/format";
import { creditData, toPage } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Credit & loans" };

const STATUSES = ["open", "overdue", "repaid", "written_off"];

export default async function CreditPage(props: PageProps<"/[locale]/console/credit">) {
  const { ctx, sp } = await pageContext(props);
  const { t, locale } = ctx;
  const c = t.credit;
  const status = STATUSES.includes(first(sp.status) ?? "") ? first(sp.status) : undefined;
  const { loans, totals, policy } = await creditData(ctx.partnerId, status, toPage(first(sp.page)));
  const sum = (k: "outstanding" | "principal" | "repaid" | "fee") => totals.map((x) => ({ currency: x.currency, amount: x[k] }));

  return (
    <>
      <PageHeader title={c.title} subtitle={c.subtitle} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={c.outstanding}>
          <MoneyList items={sum("outstanding")} locale={locale} />
        </Kpi>
        <Kpi label={c.drawn}>
          <MoneyList items={sum("principal")} locale={locale} />
        </Kpi>
        <Kpi label={c.repaid}>
          <MoneyList items={sum("repaid")} locale={locale} />
        </Kpi>
        <Kpi label={c.fees}>
          <MoneyList items={sum("fee")} locale={locale} />
        </Kpi>
      </div>

      <Card flush className="pb-0">
        <FilterForm partnerId={ctx.partnerId} showPartner={ctx.memberships.length > 1} t={t.common}>
          <FilterSelect
            name="status"
            label={t.common.status}
            value={status}
            all={t.common.all}
            options={STATUSES.map((s) => ({ value: s, label: t.labels.loanStatus[s] }))}
          />
        </FilterForm>
        <div className="mt-4">
          {loans.total === 0 ? (
            <Empty
              title={status ? t.allowances.noMatch : c.emptyTitle}
              body={status ? undefined : c.emptyBody}
              action={status ? <Link href={ctx.href("/credit")} className="text-sm font-semibold text-green underline">{t.common.reset}</Link> : undefined}
            />
          ) : (
            <>
              <DataTable label={c.title} head={[c.cols.user, c.cols.allowance, c.cols.principal, c.cols.fee, c.cols.repaid, c.cols.due, c.cols.status]}>
                {loans.rows.map((l) => (
                  <tr key={l.id}>
                    <Td>{l.holder ?? <span className="text-muted">–</span>}</Td>
                    <Td>
                      <Link href={ctx.href(`/allowances/${l.allowance_id}`)} className="font-semibold text-green hover:underline">
                        <Mono>{short(l.allowance_id, 10)}</Mono>
                      </Link>
                    </Td>
                    <Td num>{money(l.principal, l.currency, locale)}</Td>
                    <Td num>{money(l.fee, l.currency, locale)}</Td>
                    <Td num>{money(l.repaid, l.currency, locale)}</Td>
                    <Td>{dateOnly(l.due_at, locale)}</Td>
                    <Td>
                      <Status value={l.status} labels={t.labels.loanStatus} />
                    </Td>
                  </tr>
                ))}
              </DataTable>
              <Pager page={loans.page} pages={loans.pages} total={loans.total} t={t.common} hrefFor={(n) => ctx.href("/credit", { status, page: n })} />
            </>
          )}
        </div>
      </Card>

      <Card title={c.policy} hint={c.policyHint} className="mt-6">
        {ctx.canWrite ? (
          <ApiForm
            endpoint="/api/console/credit/policy"
            fixed={{ partnerId: ctx.partnerId }}
            numbers={["creditFeeBps", "creditTermDays"]}
            submitLabel={c.savePolicy}
            pendingLabel={t.common.saving}
            successLabel={c.policySaved}
            inline
          >
            <Field label={c.feeBps} hint={c.feeBpsHint}>
              <input name="creditFeeBps" type="number" min={0} max={5000} step={1} required defaultValue={policy.credit_fee_bps} className={`${inputCls} sm:w-44`} />
            </Field>
            <Field label={c.termDays} hint={c.termDaysHint}>
              <input name="creditTermDays" type="number" min={1} max={90} step={1} required defaultValue={policy.credit_term_days} className={`${inputCls} sm:w-44`} />
            </Field>
          </ApiForm>
        ) : (
          <>
            <ReadOnlyNote>{t.common.readOnly}</ReadOnlyNote>
            <p className="tabular mt-3 text-sm text-ink">
              {c.feeBps}: {policy.credit_fee_bps} · {c.termDays}: {policy.credit_term_days}
            </p>
          </>
        )}
      </Card>
    </>
  );
}

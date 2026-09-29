import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  DataTable,
  Empty,
  FilterForm,
  FilterSelect,
  Mono,
  PageHeader,
  Pager,
  Status,
  Td,
  inputCls,
} from "@/components/console/ui";
import { first, pageContext } from "@/lib/console/context";
import { dateOnly, money, num, short } from "@/lib/console/format";
import { allowanceCountries, listAllowances, toPage } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Allowances" };

const STATUSES = ["active", "closing", "closed", "revoked"];

export default async function AllowancesPage(props: PageProps<"/[locale]/console/allowances">) {
  const { ctx, sp } = await pageContext(props);
  const { t, locale } = ctx;
  const status = STATUSES.includes(first(sp.status) ?? "") ? first(sp.status) : undefined;
  const country = first(sp.country)?.toUpperCase().slice(0, 2) || undefined;
  const q = first(sp.q)?.slice(0, 100) || undefined;
  const page = toPage(first(sp.page));
  const [list, countries] = await Promise.all([
    listAllowances(ctx.partnerId, { status, country, q, page }),
    allowanceCountries(ctx.partnerId),
  ]);
  const filtered = !!(status || country || q);
  const c = t.allowances.cols;

  return (
    <>
      <PageHeader title={t.allowances.title} subtitle={t.allowances.subtitle} />
      <Card flush className="pb-0">
        <FilterForm partnerId={ctx.partnerId} showPartner={ctx.memberships.length > 1} t={t.common}>
          <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold text-muted">
            {t.common.search}
            <input name="q" defaultValue={q} placeholder={t.allowances.searchPlaceholder} className={inputCls} />
          </label>
          <FilterSelect
            name="status"
            label={t.common.status}
            value={status}
            all={t.common.all}
            options={STATUSES.map((s) => ({ value: s, label: t.labels.allowanceStatus[s] }))}
          />
          <FilterSelect
            name="country"
            label={t.common.country}
            value={country}
            all={t.common.all}
            options={countries.map((x) => ({ value: x, label: x }))}
          />
        </FilterForm>
        <div className="mt-4">
          {list.total === 0 ? (
            <Empty
              title={filtered ? t.allowances.noMatch : t.allowances.emptyTitle}
              body={filtered ? undefined : t.allowances.emptyBody}
              action={filtered ? <Link href={ctx.href("/allowances")} className="text-sm font-semibold text-green underline">{t.common.reset}</Link> : undefined}
            />
          ) : (
            <>
              <DataTable label={t.allowances.title} head={[c.id, c.ref, c.holder, c.funded, c.credit, c.settled, c.payments, c.expires, c.status]}>
                {list.rows.map((a) => (
                  <tr key={a.id} className="hover:bg-card-2">
                    <Td>
                      <Link href={ctx.href(`/allowances/${a.id}`)} className="font-semibold text-green hover:underline">
                        <Mono>{short(a.id, 10)}</Mono>
                      </Link>
                    </Td>
                    <Td>{a.external_ref ?? <span className="text-muted">–</span>}</Td>
                    <Td>{a.holder ?? <span className="text-muted">–</span>}</Td>
                    <Td num>{money(a.funded, a.currency, locale)}</Td>
                    <Td num>{money(a.credit, a.currency, locale)}</Td>
                    <Td num>{money(a.settled_funded + a.settled_credit, a.currency, locale)}</Td>
                    <Td num>{num(a.payments_count, locale)}</Td>
                    <Td>{dateOnly(a.expires_at, locale)}</Td>
                    <Td>
                      <Status value={a.status} labels={t.labels.allowanceStatus} />
                    </Td>
                  </tr>
                ))}
              </DataTable>
              <Pager
                page={list.page}
                pages={list.pages}
                total={list.total}
                t={t.common}
                hrefFor={(n) => ctx.href("/allowances", { status, country, q, page: n })}
              />
            </>
          )}
        </div>
      </Card>
    </>
  );
}

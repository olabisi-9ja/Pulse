import type { Metadata } from "next";
import Link from "next/link";
import { ApiForm } from "@/components/console/ApiForm";
import { Badge, Card, DataTable, Empty, FilterForm, PageHeader, Pager, Status, Td, inputCls } from "@/components/console/ui";
import { first, pageContext } from "@/lib/console/context";
import { dateOnly } from "@/lib/console/format";
import { listUsers, toPage } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Users & KYC" };

export default async function UsersPage(props: PageProps<"/[locale]/console/users">) {
  const { ctx, sp } = await pageContext(props);
  const { t, locale } = ctx;
  const u = t.users;
  const q = first(sp.q)?.slice(0, 100) || undefined;
  const list = await listUsers(ctx.partnerId, { q, page: toPage(first(sp.page)) });
  const fixed = (userId: string, action: string) => ({ partnerId: ctx.partnerId, userId, action });

  return (
    <>
      <PageHeader title={u.title} subtitle={u.subtitle} />
      <Card flush className="pb-0">
        <FilterForm partnerId={ctx.partnerId} showPartner={ctx.memberships.length > 1} t={t.common}>
          <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold text-muted">
            {t.common.search}
            <input name="q" defaultValue={q} placeholder={u.searchPlaceholder} className={inputCls} />
          </label>
        </FilterForm>
        <div className="mt-4">
          {list.total === 0 ? (
            <Empty
              title={q ? u.noMatch : u.emptyTitle}
              body={q ? undefined : u.emptyBody}
              action={q ? <Link href={ctx.href("/users")} className="text-sm font-semibold text-green underline">{t.common.reset}</Link> : undefined}
            />
          ) : (
            <>
              <DataTable label={u.title} head={[u.cols.user, u.cols.country, u.cols.kyc, u.cols.merchant, u.cols.joined, u.cols.status, u.cols.actions]}>
                {list.rows.map((x) => (
                  <tr key={x.id}>
                    <Td>
                      <span className="block font-semibold text-ink">{x.display_name || x.email}</span>
                      {x.display_name && <span className="block text-xs text-muted">{x.email}</span>}
                    </Td>
                    <Td>{x.country}</Td>
                    <Td>
                      <Status value={x.kyc_tier} labels={t.labels.kyc} />
                    </Td>
                    <Td>{x.is_merchant ? <Badge tone="navy">{x.merchant_name || u.merchant}</Badge> : <span className="text-muted">–</span>}</Td>
                    <Td>{dateOnly(x.created_at, locale)}</Td>
                    <Td>
                      <Status value={x.status} labels={t.labels.userStatus} />
                    </Td>
                    <Td>
                      {ctx.canWrite ? (
                        <div className="flex gap-2">
                          {x.kyc_tier === "tier1" && (
                            <ApiForm
                              endpoint="/api/console/users/update"
                              fixed={fixed(x.id, "approve_tier2")}
                              submitLabel={u.approveTier2}
                              pendingLabel={t.common.saving}
                              variant="secondary"
                            />
                          )}
                          {x.status === "active" ? (
                            <ApiForm
                              endpoint="/api/console/users/update"
                              fixed={fixed(x.id, "freeze")}
                              submitLabel={u.freeze}
                              pendingLabel={t.common.saving}
                              variant="danger"
                              confirm={u.freezeConfirm}
                            />
                          ) : (
                            <ApiForm
                              endpoint="/api/console/users/update"
                              fixed={fixed(x.id, "unfreeze")}
                              submitLabel={u.unfreeze}
                              pendingLabel={t.common.saving}
                              variant="secondary"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">–</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </DataTable>
              <Pager page={list.page} pages={list.pages} total={list.total} t={t.common} hrefFor={(n) => ctx.href("/users", { q, page: n })} />
            </>
          )}
        </div>
      </Card>
      {!ctx.canWrite && <div className="mt-4"><p className="text-xs text-muted">{t.common.readOnly}</p></div>}
    </>
  );
}

import type { Metadata } from "next";
import { listCountries } from "@payvault/countries";
import { ApiForm } from "@/components/console/ApiForm";
import { CountryPicker } from "@/components/console/CountryPicker";
import { Badge, Card, DataTable, DefList, Field, PageHeader, ReadOnlyNote, Status, Td, inputCls } from "@/components/console/ui";
import { pageContext } from "@/lib/console/context";
import { dateOnly } from "@/lib/console/format";
import { settingsData } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage(props: PageProps<"/[locale]/console/settings">) {
  const { ctx } = await pageContext(props);
  const { t, locale } = ctx;
  const s = t.settings;
  const { partner, members, hasPayments } = await settingsData(ctx.partnerId);
  const names = new Map(listCountries().map((c) => [c.code, c.name[locale]]));
  const common = { pendingLabel: t.common.saving };
  const kinds = Object.entries(t.labels.kind).filter(([k]) => k !== "sandbox");

  return (
    <>
      <PageHeader title={s.title} subtitle={s.subtitle} />
      <div className="grid gap-6">
        <Card title={s.organisation}>
          {ctx.canWrite ? (
            <ApiForm
              endpoint="/api/console/settings/organisation"
              fixed={{ partnerId: ctx.partnerId }}
              lists={["countries"]}
              submitLabel={s.saveOrg}
              successLabel={t.common.save}
              {...common}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={s.name}>
                  <input name="name" required minLength={2} maxLength={80} defaultValue={partner.name} className={inputCls} />
                </Field>
                <Field label={s.kind}>
                  {partner.kind === "sandbox" ? (
                    <input value={t.labels.kind.sandbox} disabled readOnly className={inputCls} />
                  ) : (
                    <select name="kind" defaultValue={partner.kind} className={inputCls}>
                      {kinds.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label={s.ledgerMode} hint={hasPayments ? s.ledgerLocked : undefined}>
                  <select name="ledgerMode" defaultValue={partner.ledger_mode} disabled={hasPayments} className={inputCls}>
                    {Object.entries(t.labels.ledger).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={s.slug}>
                  <input value={partner.slug} disabled readOnly className={inputCls} />
                </Field>
              </div>
              <div className="flex flex-col gap-1 text-sm font-semibold text-ink">
                {s.countries}
                <CountryPicker locale={locale} selected={partner.countries} />
              </div>
            </ApiForm>
          ) : (
            <>
              <ReadOnlyNote>{t.common.readOnly}</ReadOnlyNote>
              <div className="mt-4">
                <DefList
                  items={[
                    { label: s.name, value: partner.name },
                    { label: s.kind, value: t.labels.kind[partner.kind] ?? partner.kind },
                    { label: s.ledgerMode, value: t.labels.ledger[partner.ledger_mode] ?? partner.ledger_mode },
                    { label: s.slug, value: partner.slug },
                    { label: s.countries, value: partner.countries.map((c) => names.get(c) ?? c).join(", ") || "–" },
                  ]}
                />
              </div>
            </>
          )}
        </Card>

        <Card title={s.members} hint={s.membersHint} flush>
          <DataTable label={s.members} head={[s.memberCols.member, s.memberCols.role, s.memberCols.added, s.memberCols.actions]}>
            {members.map((m) => (
              <tr key={m.user_id}>
                <Td>
                  <span className="block font-semibold text-ink">{m.display_name || m.email || s.unknownUser}</span>
                  {m.email && m.display_name && <span className="block text-xs text-muted">{m.email}</span>}
                  {m.user_id === ctx.identity.id && <Badge tone="navy">{t.common.you}</Badge>}
                </Td>
                <Td>
                  <Status value={m.role} labels={t.labels.role} />
                </Td>
                <Td>{dateOnly(m.created_at, locale)}</Td>
                <Td>
                  {ctx.isOwner ? (
                    <ApiForm
                      endpoint="/api/console/settings/members/remove"
                      fixed={{ partnerId: ctx.partnerId, userId: m.user_id }}
                      submitLabel={s.remove}
                      variant="danger"
                      confirm={s.removeConfirm}
                      {...common}
                    />
                  ) : (
                    <span className="text-muted">–</span>
                  )}
                </Td>
              </tr>
            ))}
          </DataTable>
          <div className="border-t border-line p-4 sm:p-5">
            {ctx.isOwner ? (
              <>
                <h3 className="mb-3 text-sm font-bold text-ink">{s.addMember}</h3>
                <ApiForm
                  endpoint="/api/console/settings/members"
                  fixed={{ partnerId: ctx.partnerId }}
                  submitLabel={s.add}
                  resetOnSuccess
                  inline
                  {...common}
                >
                  <Field label={s.memberEmail}>
                    <input name="email" type="email" required maxLength={200} className={`${inputCls} sm:w-72`} />
                  </Field>
                  <Field label={s.memberRole}>
                    <select name="role" defaultValue="analyst" className={`${inputCls} sm:w-40`}>
                      <option value="admin">{t.labels.role.admin}</option>
                      <option value="analyst">{t.labels.role.analyst}</option>
                    </select>
                  </Field>
                </ApiForm>
              </>
            ) : (
              <ReadOnlyNote>{s.ownerHint}</ReadOnlyNote>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

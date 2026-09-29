import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ApiForm } from "@/components/console/ApiForm";
import { Badge, Card, DataTable, Empty, Field, Mono, PageHeader, ReadOnlyNote, Status, Td, btnSecondary, inputCls } from "@/components/console/ui";
import { pageContext } from "@/lib/console/context";
import { dateTime } from "@/lib/console/format";
import { developersData } from "@/lib/console/queries";

export const metadata: Metadata = { title: "Developers" };

export default async function DevelopersPage(props: PageProps<"/[locale]/console/developers">) {
  const { ctx } = await pageContext(props);
  const { t, locale } = ctx;
  const d = t.developers;
  const data = await developersData(ctx.partnerId);
  const common = { pendingLabel: t.common.saving, copyLabel: t.common.copy, copiedLabel: t.common.copied };

  return (
    <>
      <PageHeader
        title={d.title}
        subtitle={d.subtitle}
        actions={
          <Link href={`/${locale}/docs`} className={btnSecondary}>
            <BookOpen className="h-4 w-4" aria-hidden />
            {d.docs}
          </Link>
        }
      />
      {!ctx.canWrite && (
        <div className="mb-4">
          <ReadOnlyNote>{t.common.readOnly}</ReadOnlyNote>
        </div>
      )}

      <div className="grid gap-6">
        <Card title={d.apiKeys} hint={d.apiKeysHint} flush>
          {ctx.canWrite && (
            <div className="px-4 pb-4 sm:px-5">
              <ApiForm
                endpoint="/api/console/developers/api-keys"
                fixed={{ partnerId: ctx.partnerId }}
                submitLabel={d.createKey}
                revealLabel={d.keyCreated}
                revealHint={t.common.showOnce}
                resetOnSuccess
                inline
                {...common}
              >
                <Field label={d.keyName}>
                  <input name="name" required maxLength={60} placeholder={d.keyNamePlaceholder} className={`${inputCls} sm:w-72`} />
                </Field>
              </ApiForm>
            </div>
          )}
          {data.keys.length === 0 ? (
            <Empty title={d.noKeys} />
          ) : (
            <DataTable label={d.apiKeys} head={[d.keyCols.name, d.keyCols.prefix, d.keyCols.created, d.keyCols.lastUsed, d.keyCols.status, ""]}>
              {data.keys.map((k) => (
                <tr key={k.id}>
                  <Td className="font-semibold">{k.name}</Td>
                  <Td>
                    <Mono>pv_{k.prefix}_…</Mono>
                  </Td>
                  <Td>{dateTime(k.created_at, locale)}</Td>
                  <Td>{k.last_used_at ? dateTime(k.last_used_at, locale) : <span className="text-muted">{t.common.never}</span>}</Td>
                  <Td>{k.revoked_at ? <Badge tone="danger">{d.revokedOn}</Badge> : <Badge tone="green">{t.labels.allowanceStatus.active}</Badge>}</Td>
                  <Td>
                    {!k.revoked_at && ctx.canWrite && (
                      <ApiForm
                        endpoint="/api/console/developers/api-keys/revoke"
                        fixed={{ partnerId: ctx.partnerId, id: k.id }}
                        submitLabel={d.revoke}
                        variant="danger"
                        confirm={d.revokeConfirm}
                        {...common}
                      />
                    )}
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>

        <Card
          title={d.issuerKeys}
          hint={d.issuerKeysHint}
          flush
          action={
            ctx.isOwner ? (
              <ApiForm
                endpoint="/api/console/developers/issuer-keys/rotate"
                fixed={{ partnerId: ctx.partnerId }}
                submitLabel={d.rotate}
                variant="secondary"
                confirm={d.rotateConfirm}
                {...common}
              />
            ) : (
              <span className="text-xs text-muted">{t.common.ownerOnly}</span>
            )
          }
        >
          {data.issuers.length === 0 ? (
            <Empty title={d.noIssuer} />
          ) : (
            <DataTable label={d.issuerKeys} head={[d.issuerCols.kid, d.issuerCols.status, d.issuerCols.created, d.issuerCols.retired]}>
              {data.issuers.map((k) => (
                <tr key={k.kid}>
                  <Td num>{k.kid}</Td>
                  <Td>
                    <Status value={k.status} labels={t.labels.issuerStatus} />
                  </Td>
                  <Td>{dateTime(k.created_at, locale)}</Td>
                  <Td>{k.retired_at ? dateTime(k.retired_at, locale) : "–"}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>

        <Card title={d.webhook} hint={d.webhookHint}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              {ctx.canWrite ? (
                <ApiForm
                  endpoint="/api/console/developers/webhook"
                  fixed={{ partnerId: ctx.partnerId }}
                  submitLabel={d.saveWebhook}
                  successLabel={t.common.save}
                  {...common}
                >
                  <Field label={d.webhookUrl}>
                    <input name="url" type="url" defaultValue={data.webhook.webhook_url ?? ""} placeholder="https://example.com/payvault/webhooks" maxLength={500} className={inputCls} />
                  </Field>
                </ApiForm>
              ) : (
                <p className="break-all text-sm text-ink">{data.webhook.webhook_url ?? "–"}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{d.webhookSecret}</p>
              <p className="mb-3 mt-1 text-xs text-muted">{data.webhook.has_secret ? d.secretSet : d.secretNotSet}</p>
              {ctx.canWrite && (
                <ApiForm
                  endpoint="/api/console/developers/webhook"
                  fixed={{ partnerId: ctx.partnerId, generateSecret: true }}
                  submitLabel={d.generateSecret}
                  variant="secondary"
                  confirm={data.webhook.has_secret ? d.generateSecretConfirm : undefined}
                  revealLabel={d.secretCreated}
                  revealHint={t.common.showOnce}
                  {...common}
                />
              )}
              <p className="mt-3 text-xs text-muted">{d.signingHint}</p>
            </div>
          </div>
        </Card>

        <Card title={d.deliveries} flush>
          {data.events.length === 0 ? (
            <Empty title={d.noDeliveries} />
          ) : (
            <DataTable label={d.deliveries} head={[d.deliveriesCols.time, d.deliveriesCols.type, d.deliveriesCols.delivered, d.deliveriesCols.attempts, d.deliveriesCols.error]}>
              {data.events.map((e) => (
                <tr key={e.id}>
                  <Td>{dateTime(e.created_at, locale)}</Td>
                  <Td>
                    <code className="font-mono text-xs">{e.type}</code>
                  </Td>
                  <Td>{e.delivered_at ? dateTime(e.delivered_at, locale) : <Badge tone="warn">{t.overview.pending}</Badge>}</Td>
                  <Td num>{e.attempts}</Td>
                  <Td className="max-w-xs truncate text-danger">{e.last_error ?? ""}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiForm } from "@/components/console/ApiForm";
import { CountryPicker } from "@/components/console/CountryPicker";
import { Card, Field, PageHeader, inputCls } from "@/components/console/ui";
import { requireIdentityOrRedirect } from "@/lib/console/context";
import { isLocale } from "@/lib/i18n";
import { partnerMemberships } from "@/lib/server/auth";
import { getConsoleMessages } from "@/messages/console";

export const metadata: Metadata = { title: "Set up your organisation" };

export default async function OnboardingPage({ params }: PageProps<"/[locale]/console/onboarding">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const identity = await requireIdentityOrRedirect(locale);
  const memberships = await partnerMemberships(identity.id);
  const t = getConsoleMessages(locale);
  const o = t.onboarding;
  const isAdmin = (process.env.PV_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(identity.email.toLowerCase());
  const done = `/${locale}/console`;

  if (memberships.length > 0 && !isAdmin) redirect(done);

  return (
    <>
      <PageHeader title={o.title} subtitle={o.subtitle} />
      {memberships.length > 0 && (
        <p className="mb-4 text-sm text-muted">
          {o.alreadyMember}{" "}
          <Link href={done} className="font-semibold text-green underline">
            {o.goToConsole}
          </Link>
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <ApiForm
            endpoint="/api/console/partners"
            lists={["countries"]}
            submitLabel={o.create}
            pendingLabel={t.common.saving}
            redirectTo={done}
          >
            <Field label={o.name}>
              <input name="name" required minLength={2} maxLength={80} placeholder={o.namePlaceholder} className={inputCls} />
            </Field>
            <Field label={o.kind}>
              <select name="kind" defaultValue="fintech" className={inputCls}>
                {Object.entries(o.kinds).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex flex-col gap-1 text-sm font-semibold text-ink">
              <span id="countries-label">{o.countries}</span>
              <CountryPicker locale={locale} />
              <span className="text-xs font-normal text-muted">{o.countriesHint}</span>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">{o.ledgerMode}</legend>
              {(
                [
                  ["hosted", o.ledgerHosted, o.ledgerHostedHint],
                  ["external", o.ledgerExternal, o.ledgerExternalHint],
                ] as const
              ).map(([v, l, h]) => (
                <label key={v} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 has-[:checked]:border-green has-[:checked]:bg-green-soft">
                  <input type="radio" name="ledgerMode" value={v} defaultChecked={v === "hosted"} className="mt-1 accent-[var(--pv-green)]" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{l}</span>
                    <span className="block text-xs text-muted">{h}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </ApiForm>
        </Card>

        {isAdmin && (
          <Card title={o.sandboxTitle}>
            <p className="mb-4 text-sm text-muted">{o.sandboxBody}</p>
            <ApiForm endpoint="/api/console/partners/sandbox" submitLabel={o.sandboxButton} pendingLabel={t.common.saving} redirectTo={done} variant="secondary" />
          </Card>
        )}
      </div>
    </>
  );
}

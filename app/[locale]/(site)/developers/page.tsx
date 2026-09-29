import { Bell, Code2, PackageOpen, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/site/CodeBlock";
import { siteMetadata } from "@/components/site/meta";
import { ButtonLink, Card, CheckList, CtaBand, IconBadge, PageHero, Pill, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/developers">) {
  return siteMetadata(params, "developers", "developers");
}

const ISSUE = `POST /api/v1/allowances
Authorization: Bearer pv_<prefix>_<secret>
Content-Type: application/json

{
  "devicePublicKey": "02c4f1...e9",
  "country": "NG",
  "funded": 500000,
  "credit": 0,
  "externalRef": "cust_8123_vault_1",
  "ttlHours": 72
}

// 201 Created
{
  "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
  "cert": "AQEAn8sc63...",
  "issuerKid": 3,
  "currency": "NGN",
  "expiresAt": "2026-10-02T09:30:00.000Z"
}`;

const SYNC = `POST /api/v1/payments/sync
Authorization: Bearer pv_<prefix>_<secret>
Content-Type: application/json

{
  "bundles": ["AQMBAQEAn8sc...", "AQMBAQEAn8sc..."]
}

// 200 OK
{
  "results": [
    { "id": "5d0e...c1", "status": "settled", "amount": 250000, "currency": "NGN" },
    { "id": "77ab...09", "status": "flagged" }
  ]
}`;

const HOOK = `{
  "id": 1042,
  "type": "fraud.detected",
  "createdAt": "2026-10-02T11:04:12.000Z",
  "data": {
    "allowanceId": "9f2c...",
    "cases": [{ "kind": "fork", "seq": 3, "paymentIds": ["5d0e...c1", "77ab...09"], "loss": 0 }]
  }
}`;

const icons = [Send, PackageOpen, Bell];

export default async function DevelopersPage({ params }: PageProps<"/[locale]/developers">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.developers;

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead}>
        <ButtonLink href={`/${locale}/docs`} arrow>
          {t.common.readDocs}
        </ButtonLink>
        <ButtonLink href={`/${locale}/contact`} tone="secondary">
          {t.common.requestPilot}
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {p.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <Card key={s.title}>
                <IconBadge>
                  <Icon className="h-5 w-5" />
                </IconBadge>
                <h2 className="mt-4 font-display text-lg font-bold text-navy">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="card" labelledBy="code">
        <SectionHeading id="code" title={p.codeTitle} lead={p.codeNote} />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <CodeBlock label={p.codeLabels.issue} code={ISSUE} />
          <div className="space-y-4">
            <CodeBlock label={p.codeLabels.sync} code={SYNC} />
            <CodeBlock label={p.codeLabels.webhook} code={HOOK} />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title={p.sdk.title} />
            <ul className="mt-6 space-y-3">
              {p.sdk.items.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4">
                  <span className="flex items-center gap-3 font-semibold text-navy">
                    <Code2 className="h-5 w-5 text-green" aria-hidden />
                    {s.name}
                  </span>
                  <Pill tone={s.status === p.sdk.items[0].status ? "green" : "muted"}>{s.status}</Pill>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title={p.principles.title} />
            <CheckList items={p.principles.items} className="mt-6" />
          </div>
        </div>
      </Section>

      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/docs`, label: t.common.readDocs }}
        secondary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
      />
    </>
  );
}

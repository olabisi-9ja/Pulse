import { Fingerprint, KeyRound, Link2, Timer, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { Card, CtaBand, IconBadge, PageHero, Section, SectionHeading, TwoColTable } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/security">) {
  return siteMetadata(params, "security", "security");
}

const cryptoIcons = [KeyRound, Link2, Fingerprint, Fingerprint, Timer];

export default async function SecurityPage({ params }: PageProps<"/[locale]/security">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.security;

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead} />

      <Section labelledBy="custody">
        <div className="grid items-start gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
          <IconBadge className="h-14 w-14">
            <Wallet className="h-7 w-7" />
          </IconBadge>
          <div>
            <h2 id="custody" className="font-display text-3xl font-medium text-navy sm:text-4xl">
              {p.custody.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">{p.custody.body}</p>
          </div>
        </div>
      </Section>

      <Section tone="card" labelledBy="threats">
        <SectionHeading id="threats" title={p.threats.title} />
        <div className="mt-10">
          <TwoColTable
            caption={p.threats.title}
            head={[p.threats.head.threat, p.threats.head.mitigation]}
            rows={p.threats.rows.map((r) => [r.threat, r.mitigation] as const)}
          />
        </div>
      </Section>

      <Section labelledBy="crypto">
        <SectionHeading id="crypto" title={p.crypto.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.crypto.items.map((c, i) => {
            const Icon = cryptoIcons[i];
            return (
              <Card key={c.name}>
                <IconBadge>
                  <Icon className="h-5 w-5" />
                </IconBadge>
                <h3 className="mt-4 font-display text-lg font-medium text-navy">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="card">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-2xl font-medium text-navy">{p.guarantee.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{p.guarantee.body}</p>
          </Card>
          <div className="rounded-3xl border border-line bg-warn-soft p-6 sm:p-7">
            <h2 className="font-display text-2xl font-medium text-warn">{p.status.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">{p.status.body}</p>
          </div>
        </div>
      </Section>

      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
        secondary={{ href: `/${locale}/how-it-works`, label: t.nav.howItWorks }}
      />
    </>
  );
}

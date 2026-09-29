import { CheckCircle2, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { FlowDiagram } from "@/components/site/FlowDiagram";
import { ProtocolLayers } from "@/components/site/ProtocolLayers";
import { siteMetadata } from "@/components/site/meta";
import { StackCards } from "@/components/site/StackCards";
import { ButtonLink, Card, CtaBand, PageHero, Section, SectionHeading, TwoColTable } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { photos } from "@/lib/photos";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">) {
  return siteMetadata(params, "howItWorks", "how-it-works");
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.howItWorks;

  return (
    <>
      <PageHero title={p.hero.title} lead={p.hero.lead} photos={[photos.trader, photos.agent]}>
        <ButtonLink href={`/${locale}/contact`} arrow>
          {t.common.requestPilot}
        </ButtonLink>
        <ButtonLink href={`/${locale}/security`} tone="secondary">
          {t.footer.security}
        </ButtonLink>
      </PageHero>

      <Section labelledBy="lifecycle">
        <SectionHeading id="lifecycle" title={p.lifecycle.title} />
        <StackCards
          items={p.lifecycle.steps.map((s, i) => ({ title: s.title, body: s.body, visual: (["lock", "certify", "sign", "sync"] as const)[i] ?? "sync" }))}
        />
      </Section>

      <Section tone="card">
        <FlowDiagram t={t.flow} />
      </Section>

      <Section labelledBy="verify">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading id="verify" title={p.verify.title} lead={p.verify.lead} />
          <ul className="space-y-3">
            {p.verify.checks.map((c) => (
              <li key={c} className="flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="card">
        <ProtocolLayers t={t.layers} />
      </Section>

      <Section labelledBy="double">
        <SectionHeading id="double" title={p.doubleSpend.title} lead={p.doubleSpend.body} />
        <div className="mt-10">
          <TwoColTable
            caption={p.doubleSpend.title}
            head={[p.doubleSpend.head.defence, p.doubleSpend.head.effect]}
            rows={p.doubleSpend.rows.map((r) => [r.defence, r.effect] as const)}
          />
        </div>
      </Section>

      <Section tone="card" labelledBy="sync">
        <SectionHeading id="sync" title={p.sync.title} lead={p.sync.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {p.sync.points.map((pt) => (
            <Card key={pt.title}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green" aria-hidden />
                <h3 className="font-display text-lg font-medium text-navy">{pt.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pt.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
        secondary={{ href: `/${locale}/developers`, label: t.nav.developers }}
      />
    </>
  );
}

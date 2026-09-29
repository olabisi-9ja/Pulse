import { Boxes, Code2, LayoutDashboard, Smartphone } from "lucide-react";
import { notFound } from "next/navigation";
import { MetricsGrid } from "@/components/site/MetricsGrid";
import { TwoLayers } from "@/components/site/TwoLayers";
import { siteMetadata } from "@/components/site/meta";
import { ButtonLink, Card, CheckList, CtaBand, IconBadge, PageHero, Pill, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/product">) {
  return siteMetadata(params, "product", "product");
}

const icons = [Smartphone, LayoutDashboard, Boxes, Code2];

export default async function ProductPage({ params }: PageProps<"/[locale]/product">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.product;

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead}>
        <ButtonLink href={`/${locale}/app`} tone="secondary">
          {t.nav.openApp}
        </ButtonLink>
        <ButtonLink href={`/${locale}/console`}>{t.nav.console}</ButtonLink>
      </PageHero>

      <Section labelledBy="two-layers">
        <TwoLayers t={t.twoLayers} headingId="two-layers" />
      </Section>

      <Section tone="card">
        <div className="grid gap-4 md:grid-cols-2">
          {p.surfaces.map((s, i) => {
            const Icon = icons[i];
            return (
              <Card key={s.title} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <IconBadge>
                    <Icon className="h-5 w-5" />
                  </IconBadge>
                  <Pill tone="green">{s.status}</Pill>
                </div>
                <h2 className="mt-4 font-display text-2xl font-medium text-navy">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{s.body}</p>
                <CheckList items={s.bullets} className="mt-5" />
              </Card>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="custody">
        <SectionHeading id="custody" eyebrow={p.nonCustodial.eyebrow} title={p.nonCustodial.title} lead={p.nonCustodial.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-display text-xl font-medium text-navy">{p.nonCustodial.partnerTitle}</h3>
            <CheckList items={p.nonCustodial.partner} className="mt-4" />
          </Card>
          <Card>
            <h3 className="font-display text-xl font-medium text-green">{p.nonCustodial.payvaultTitle}</h3>
            <CheckList items={p.nonCustodial.payvault} className="mt-4" />
          </Card>
        </div>
      </Section>

      <Section tone="card" labelledBy="metrics">
        <MetricsGrid t={t.metrics} headingId="metrics" />
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

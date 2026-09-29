import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { Card, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  return siteMetadata(params, "about", "about");
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.about;

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead} />

      <Section labelledBy="mission">
        <SectionHeading id="mission" title={p.mission.title} lead={p.mission.body} />
      </Section>

      <Section tone="card" labelledBy="principles">
        <SectionHeading id="principles" title={p.principles.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {p.principles.items.map((it) => (
            <Card key={it.title}>
              <h3 className="font-display text-lg font-medium text-navy">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{it.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section labelledBy="status">
        <div className="rounded-3xl border border-line bg-warn-soft p-6 sm:p-8">
          <h2 id="status" className="font-display text-2xl font-medium text-warn">
            {p.status.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink">{p.status.body}</p>
        </div>
      </Section>

      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
      />
    </>
  );
}

import { Bus, CreditCard, Globe2, GraduationCap, HandCoins, Landmark, Smartphone, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { Card, CtaBand, IconBadge, PageHero, Section } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/use-cases">) {
  return siteMetadata(params, "useCases", "use-cases");
}

const icons = [CreditCard, Landmark, Smartphone, Store, Bus, GraduationCap, HandCoins, Globe2];

export default async function UseCasesPage({ params }: PageProps<"/[locale]/use-cases">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.useCases;

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead} />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {p.cases.map((c, i) => {
            const Icon = icons[i];
            return (
              <Card key={c.title}>
                <div className="flex items-center gap-3">
                  <IconBadge>
                    <Icon className="h-5 w-5" />
                  </IconBadge>
                  <h2 className="font-display text-xl font-medium text-navy">{c.title}</h2>
                </div>
                <dl className="mt-5 space-y-4 text-sm leading-relaxed sm:text-base">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted">{p.labels.scenario}</dt>
                    <dd className="mt-1 text-ink">{c.scenario}</dd>
                  </div>
                  <div className="rounded-2xl bg-green-soft p-4">
                    <dt className="text-xs font-bold uppercase tracking-wider text-green">{p.labels.benefit}</dt>
                    <dd className="mt-1 text-ink">{c.benefit}</dd>
                  </div>
                </dl>
              </Card>
            );
          })}
        </div>
      </Section>
      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
        secondary={{ href: `/${locale}/coverage`, label: t.common.seeCoverage }}
      />
    </>
  );
}

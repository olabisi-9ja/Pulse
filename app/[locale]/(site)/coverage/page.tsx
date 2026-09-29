import { notFound } from "next/navigation";
import { REGIONS, SUPPORTED_CURRENCIES, countryPacks } from "@payvault/countries";
import { CountryCard } from "@/components/site/CountryCard";
import { siteMetadata } from "@/components/site/meta";
import { Card, CheckList, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/coverage">) {
  return siteMetadata(params, "coverage", "coverage");
}

export default async function CoveragePage({ params }: PageProps<"/[locale]/coverage">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.coverage;

  const groups = REGIONS.map((region) => ({
    region,
    packs: countryPacks
      .filter((c) => c.region === region)
      .sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale)),
  })).filter((g) => g.packs.length > 0);
  const conceptCount = countryPacks.filter((c) => c.status === "concept").length;

  const stats: [number, string][] = [
    [countryPacks.length, p.stats.countries],
    [SUPPORTED_CURRENCIES.length, p.stats.currencies],
    [groups.length, p.stats.regions],
    [conceptCount, p.stats.concept],
  ];

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead} />

      <Section>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([n, label]) => (
            <Card key={label} className="p-5 sm:p-6">
              <dd className="tabular font-display text-4xl font-medium text-green">{n}</dd>
              <dt className="mt-1 text-sm font-semibold text-muted">{label}</dt>
            </Card>
          ))}
        </dl>
        <div className="mt-6 rounded-3xl border border-line bg-warn-soft p-6">
          <h2 className="font-display text-lg font-medium text-warn">{p.notice.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">{p.notice.body}</p>
        </div>
      </Section>

      {groups.map((g, gi) => (
        <Section key={g.region} tone={gi % 2 === 0 ? "card" : "paper"} labelledBy={`region-${g.region}`} className="py-12! sm:py-16!">
          <SectionHeading id={`region-${g.region}`} title={p.regions[g.region]} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.packs.map((pack) => (
              <CountryCard key={pack.code} pack={pack} locale={locale} t={p} />
            ))}
          </div>
        </Section>
      ))}

      <Section labelledBy="what">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading id="what" title={p.what.title} />
          <CheckList items={p.what.items} />
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

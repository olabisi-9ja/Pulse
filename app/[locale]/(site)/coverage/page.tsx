import { notFound } from "next/navigation";
import { REGIONS, countryPacks, formatMinor } from "@payvault/countries";
import { CoverageExplorer, type ExplorerCountry } from "@/components/site/CoverageExplorer";
import { siteMetadata } from "@/components/site/meta";
import { CheckList, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/ui";
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

  const countries: ExplorerCountry[] = groups.flatMap((g) =>
    g.packs.map((pack) => ({
      code: pack.code,
      name: pack.name[locale],
      region: pack.region,
      bloc: pack.bloc ?? undefined,
      currencyCode: pack.currency.code,
      currencyName: pack.currency.name[locale],
      perPayment: formatMinor(pack.offlineLimits.perTransaction, pack.currency.code, locale),
      cap: formatMinor(pack.offlineLimits.allowanceCap, pack.currency.code, locale),
      rails: pack.rails.domestic.map((r) => r.name),
      papss: pack.rails.crossBorder.includes("papss"),
      authority: pack.dataProtection.authority,
      residency: p.card.residency[pack.dataProtection.residency],
      status: p.status[pack.status],
      concept: pack.status === "concept",
    })),
  );

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} lead={p.hero.lead} />

      <Section labelledBy="explore">
        <h2 id="explore" className="sr-only">
          {p.explorer.hint}
        </h2>
        <CoverageExplorer
          countries={countries}
          regions={groups.map((g) => g.region)}
          labels={{
            all: p.explorer.all,
            hint: p.explorer.hint,
            regions: p.regions,
            perPayment: p.card.perTransaction,
            cap: p.card.allowanceCap,
            rails: p.card.rails,
            papss: p.card.papssYes,
            dataLaw: p.card.dataLaw,
          }}
        />
        <p className="mt-12 max-w-3xl border-l-2 border-warn pl-4 text-sm leading-relaxed text-muted">{p.notice.body}</p>
      </Section>

      <Section tone="card" labelledBy="what">
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

import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { listCountries } from "@payvault/countries";
import { FlowDiagram } from "@/components/site/FlowDiagram";
import { Numbers } from "@/components/site/Numbers";
import { PhotoOrVisual } from "@/components/site/PhotoOrVisual";
import { TwoLayers } from "@/components/site/TwoLayers";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Reveal } from "@/components/site/Reveal";
import { siteMetadata } from "@/components/site/meta";
import { ButtonLink, Card, Container, CtaBand, Eyebrow, HeadlinePill, Section, SectionHeading, Watermark } from "@/components/site/ui";
import type { VignetteKind } from "@/components/site/Vignettes";
import { photos } from "@/lib/photos";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  return siteMetadata(params, "home");
}

const AUDIENCE_PHOTOS = ["shop", "bank", "agent", "trader", "transit", "school"];
const AUDIENCE_VISUALS: VignetteKind[] = ["verify", "platform", "sync", "request", "scan", "usage"];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const h = t.home;
  const countries = listCountries();

  return (
    <>
      {/* Hero */}
      <section className="pv-invert relative overflow-hidden">
        <Watermark className="-left-24 top-4 h-[34rem] w-[33rem] opacity-[0.07] lg:left-[12%] lg:h-[46rem] lg:w-[44rem]" />
        <Container className="relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.3fr_1fr] lg:gap-10 lg:pb-28 lg:pt-24">
          <div>
            <Reveal onMount>
              <Eyebrow className="mb-8">{h.hero.eyebrow}</Eyebrow>
              <h1 className="font-display text-[clamp(3.25rem,10vw,7.25rem)] font-medium leading-[0.92] text-navy">
                {h.hero.line1}
                <span className="block whitespace-nowrap text-green">
                  <HeadlinePill className="ml-0 mr-[0.2em]" />
                  {h.hero.line2}
                </span>
              </h1>
            </Reveal>
            <Reveal onMount delay={0.1}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted sm:text-lg">{h.hero.short}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href={`/${locale}/contact`} arrow>
                  {t.common.requestPilot}
                </ButtonLink>
                <ButtonLink href={`/${locale}/how-it-works`} tone="secondary">
                  {t.common.seeHow}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <Reveal onMount delay={0.2}>
            <PhoneMockup t={t.mock} />
          </Reveal>
        </Container>
      </section>

      {/* Numbers */}
      <Section labelledBy="numbers">
        <Numbers
          id="numbers"
          title={h.numbers.title}
          note={h.numbers.note}
          rows={[
            { value: String(countries.length), label: h.numbers.packs, visual: "codes", codes: countries.slice(0, 15).map((c) => c.code) },
            { value: "276 B", label: h.numbers.bytes, visual: "qr" },
            { value: "0", label: h.numbers.bars, photo: photos.trader, visual: "verify" },
            { value: "2", label: h.numbers.languages, visual: "request" },
          ]}
        />
      </Section>

      {/* Two layers */}
      <Section tone="card" labelledBy="layers-a-b">
        <TwoLayers t={t.twoLayers} headingId="layers-a-b" />
        <div className="mt-10">
          <ButtonLink href={`/${locale}/product`} tone="secondary" arrow>
            {t.nav.product}
          </ButtonLink>
        </div>
      </Section>

      {/* Flow */}
      <Section>
        <FlowDiagram t={t.flow} eyebrow={h.flowEyebrow} />
        <div className="mt-10">
          <ButtonLink href={`/${locale}/how-it-works`} tone="secondary" arrow>
            {t.common.seeHow}
          </ButtonLink>
        </div>
      </Section>

      {/* Pay later */}
      <Section tone="card" labelledBy="paylater">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading id="paylater" eyebrow={h.payLater.eyebrow} title={h.payLater.title} />
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {h.payLater.points.map((p) => (
                <li key={p} className="py-4 text-base leading-relaxed text-ink">
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ButtonLink href={`/${locale}/pay-later`} arrow>
                {h.payLater.cta}
              </ButtonLink>
            </div>
          </div>
          <PhotoOrVisual photo={photos.shop} visual="extend" className="aspect-[4/5]" />
        </div>
      </Section>

      {/* Audience */}
      <Section labelledBy="audience">
        <SectionHeading id="audience" eyebrow={h.audience.eyebrow} title={h.audience.title} />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {h.audience.items.map((it, i) => (
            <li key={it.title} className="flex flex-col overflow-hidden rounded-[1.75rem] rounded-br-[4.5rem] bg-card">
              <PhotoOrVisual photo={photos[AUDIENCE_PHOTOS[i]] ?? null} visual={AUDIENCE_VISUALS[i]} className="aspect-[16/10] rounded-none rounded-br-none" />
              <div className="flex flex-1 items-end justify-between gap-4 p-6">
                <div>
                  <h3 className="font-display text-2xl font-medium leading-tight text-navy">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
                </div>
                <Plus className="h-5 w-5 shrink-0 text-green" aria-hidden />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href={`/${locale}/use-cases`} tone="secondary" arrow>
            {t.nav.useCases}
          </ButtonLink>
        </div>
      </Section>

      {/* Honest */}
      <Section tone="card" labelledBy="honest">
        <SectionHeading id="honest" eyebrow={h.honest.eyebrow} title={h.honest.title} />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {h.honest.items.map((it) => (
            <Card key={it.title} className="flex min-h-[16rem] flex-col justify-between">
              <h3 className="font-display text-4xl font-medium text-green">{it.title}</h3>
              <p className="mt-8 text-sm leading-relaxed text-muted sm:text-base">{it.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href={`/${locale}/security`} tone="secondary" arrow>
            {h.honest.cta}
          </ButtonLink>
        </div>
      </Section>

      <CtaBand
        title={h.cta.title}
        body={h.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
        secondary={{ href: `/${locale}/developers`, label: t.nav.developers }}
      />
    </>
  );
}

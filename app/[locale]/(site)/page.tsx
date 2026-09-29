import { Check, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { listCountries } from "@payvault/countries";
import { FlowDiagram } from "@/components/site/FlowDiagram";
import { Numbers } from "@/components/site/Numbers";
import { PhotoOrVisual } from "@/components/site/PhotoOrVisual";
import { TwoLayers } from "@/components/site/TwoLayers";
import { HeroShapes } from "@/components/site/HeroShapes";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Reveal } from "@/components/site/Reveal";
import { siteMetadata } from "@/components/site/meta";
import { ButtonLink, Card, Container, CtaBand, Section, SectionHeading } from "@/components/site/ui";
import { Vignette, type VignetteKind } from "@/components/site/Vignettes";
import { photos } from "@/lib/photos";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  return siteMetadata(params, "home");
}

const AUDIENCE_PHOTOS = ["stall", "bank", "agent", "shop", "transit", "school"];
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
      <section className="relative overflow-hidden bg-paper">
        <Container className="pt-12 sm:pt-16">
          <Reveal onMount>
            <h1 className="font-display text-[clamp(3.25rem,10vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-navy">
              <span className="block">{h.hero.line1}</span>
              <span className="block text-green">{h.hero.line2}</span>
            </h1>
          </Reveal>
          <Reveal onMount delay={0.1}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted sm:text-lg">{h.hero.short}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/${locale}/contact`} arrow>
                {t.common.requestPilot}
              </ButtonLink>
              <ButtonLink href={`/${locale}/how-it-works`} tone="secondary">
                {t.common.seeHow}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal onMount delay={0.15}>
            <HeroShapes left={photos.trader} right={photos.agent} />
          </Reveal>
        </Container>
        {/* Arc into the navy stage below */}
        <div aria-hidden className="pv-invert mx-auto mt-16 h-20 w-[160%] -translate-x-[18.75%] rounded-t-[100%] bg-paper sm:h-28" />
      </section>

      <section className="pv-invert relative -mt-px">
        {/* Stage: one card per audience, like a product shelf */}
        <Container className="relative pb-16 pt-2 sm:pb-24">
          <Reveal onMount delay={0.2} className="grid gap-4 lg:grid-cols-12">
            <article className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2rem] rounded-br-[6rem] bg-[#046b4f] p-7 text-white sm:p-10 lg:col-span-7">
              <div>
                <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium">{h.hero.stagePartners}</span>
                <h2 className="mt-5 max-w-sm font-display text-3xl font-medium leading-[1.05] sm:text-4xl">{h.hero.stagePartnersTitle}</h2>
              </div>
              <div aria-hidden className="mt-8 flex items-end justify-end gap-4">
                <div className="w-[16rem] shrink-0">
                  <Vignette kind="platform" />
                </div>
                <div className="hidden w-[16rem] shrink-0 xl:block">
                  <Vignette kind="sync" />
                </div>
              </div>
            </article>
            <article className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-[2rem] rounded-br-[6rem] bg-gradient-to-br from-[#eef3fa] to-[#d6e3f3] p-7 text-[#0b1726] sm:p-10 lg:col-span-5">
              <span aria-hidden className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#b9cde8]" />
              <span className="relative inline-flex w-fit rounded-full bg-[#14365a]/10 px-3.5 py-1.5 text-xs font-medium">{h.hero.stageCustomers}</span>
              <h2 className="relative mt-5 max-w-xs font-display text-3xl font-medium leading-[1.05] sm:text-4xl">{h.hero.stageCustomersTitle}</h2>
              <div aria-hidden className="pointer-events-none relative mt-8 flex flex-1 items-end justify-center [perspective:1400px]">
                <div className="w-[16rem] [transform:rotateX(10deg)_rotateY(-20deg)_rotateZ(-7deg)] drop-shadow-[0_40px_40px_rgb(20_54_90/0.35)]">
                  <PhoneMockup t={t.mock} bare />
                </div>
                <div className="absolute bottom-6 left-0 w-56 rounded-2xl bg-white p-4 shadow-[0_24px_48px_-16px_rgb(20_54_90/0.45)] sm:left-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e2f2ec] text-[#046b4f]">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#0b1726]">{h.hero.floatTitle}</p>
                      <p className="text-[0.65rem] text-[#5b6b7c]">{h.hero.floatMeta}</p>
                    </div>
                  </div>
                  <p className="tabular mt-3 font-display text-2xl font-medium tracking-tight text-[#0b1726]">XOF 1,500</p>
                </div>
              </div>
            </article>
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
            { value: "0", label: h.numbers.bars, visual: "verify" },
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
          <PhotoOrVisual photo={photos.stall} visual="extend" className="aspect-[4/5]" />
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

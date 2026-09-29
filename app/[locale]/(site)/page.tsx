import {
  Banknote,
  Building2,
  Bus,
  CalendarClock,
  Code2,
  CreditCard,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Smartphone,
  Store,
  Ban,
  Radar,
  Scale,
  Boxes,
  ScanSearch,
  ShieldAlert,
  WifiOff,
  Wallet,
  Coins,
  Clock,
} from "lucide-react";
import { notFound } from "next/navigation";
import { SUPPORTED_CURRENCIES, listCountries } from "@payvault/countries";
import { FlowDiagram } from "@/components/site/FlowDiagram";
import { TwoLayers } from "@/components/site/TwoLayers";
import { HeroHand } from "@/components/site/HeroHand";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Reveal } from "@/components/site/Reveal";
import { siteMetadata } from "@/components/site/meta";
import {
  ButtonLink,
  Card,
  Container,
  CtaBand,
  Eyebrow,
  IconBadge,
  Pill,
  Section,
  SectionHeading,
  Watermark,
} from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  return siteMetadata(params, "home");
}

const problemIcons = [Ban, Banknote, Coins];
const audienceIcons = [CreditCard, Landmark, Smartphone, Store, Bus, GraduationCap];
const honestIcons = [Scale, Radar, ShieldAlert];
const surfaceIcons = [Smartphone, LayoutDashboard, Boxes, Code2];
const taglineIcons = [WifiOff, Clock, ScanSearch];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const h = t.home;
  const countries = listCountries();
  const regions = new Set(countries.map((c) => c.region)).size;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <Watermark className="-left-24 top-4 h-[34rem] w-[33rem] opacity-[0.05] lg:left-[12%] lg:h-[46rem] lg:w-[44rem]" />
        <Container className="relative grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:pb-24 lg:pt-20">
          <div>
            <Reveal onMount>
              <Eyebrow className="mb-6">{h.hero.eyebrow}</Eyebrow>
              <h1 className="font-display text-[clamp(2.5rem,9.5vw,5.75rem)] font-black uppercase leading-[0.95] tracking-tight">
                <span className="block text-navy">{h.hero.line1}</span>
                <span className="block text-green">{h.hero.line2}</span>
              </h1>
            </Reveal>
            <Reveal onMount delay={0.1}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{h.hero.lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/${locale}/contact`} arrow>
                  {t.common.requestPilot}
                </ButtonLink>
                <ButtonLink href={`/${locale}/how-it-works`} tone="secondary">
                  {t.common.seeHow}
                </ButtonLink>
              </div>
              <p className="mt-6 max-w-xl border-l-2 border-green pl-4 text-sm leading-relaxed text-muted">{h.hero.fine}</p>
            </Reveal>
          </div>
          <div className="relative">
            <HeroHand className="absolute -bottom-16 left-1/2 h-[42rem] w-[40rem] -translate-x-1/2" />
            <Reveal onMount delay={0.2} className="relative">
              <PhoneMockup t={t.mock} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Tagline */}
      <Section labelledBy="tagline">
        <Reveal>
          <h2 id="tagline" className="max-w-3xl font-display text-3xl font-extrabold leading-[1.1] text-navy text-balance sm:text-4xl lg:text-[2.75rem]">
            {h.tagline.title}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {h.tagline.items.map((it, i) => {
            const Icon = taglineIcons[i];
            return (
              <Reveal key={it.title} delay={i * 0.08}>
                <Card className="h-full">
                  <IconBadge>
                    <Icon className="h-5 w-5" />
                  </IconBadge>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{it.body}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Problem */}
      <Section tone="card" labelledBy="problem">
        <SectionHeading id="problem" eyebrow={h.problem.eyebrow} title={h.problem.title} lead={h.problem.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {h.problem.points.map((p, i) => {
            const Icon = problemIcons[i];
            return (
              <Card key={p.title}>
                <Icon className="h-6 w-6 text-danger" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Two layers */}
      <Section labelledBy="layers-a-b">
        <TwoLayers t={t.twoLayers} headingId="layers-a-b" />
        <div className="mt-8">
          <ButtonLink href={`/${locale}/product`} tone="secondary" arrow>
            {t.nav.product}
          </ButtonLink>
        </div>
      </Section>

      {/* Flow */}
      <Section tone="card">
        <FlowDiagram t={t.flow} eyebrow={h.flowEyebrow} />
        <div className="mt-8">
          <ButtonLink href={`/${locale}/how-it-works`} tone="secondary" arrow>
            {t.common.seeHow}
          </ButtonLink>
        </div>
      </Section>

      {/* Pay later */}
      <Section tone="card" labelledBy="paylater">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading id="paylater" eyebrow={h.payLater.eyebrow} title={h.payLater.title} lead={h.payLater.body} />
            <ul className="mt-6 space-y-3">
              {h.payLater.points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href={`/${locale}/pay-later`} arrow>
                {h.payLater.cta}
              </ButtonLink>
            </div>
          </div>
          <Card className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-navy">{t.mock.greeting}</p>
              <Pill tone="navy">{t.mock.currency}</Pill>
            </div>
            <div className="rounded-2xl bg-green-soft p-4">
              <p className="text-xs font-semibold text-green">{t.mock.vaultNote}</p>
              <p className="tabular font-display text-3xl font-extrabold text-navy">{t.mock.vaultAmount}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-green p-4">
              <Wallet className="h-6 w-6 shrink-0 text-green" aria-hidden />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">{t.mock.overdraft}</p>
                <p className="text-xs text-muted">{t.mock.overdraftNote}</p>
              </div>
              <p className="tabular font-display text-xl font-extrabold text-green">{t.mock.overdraftAmount}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-card-2 p-4 text-sm text-muted">
              <CalendarClock className="h-5 w-5 shrink-0 text-navy" aria-hidden />
              {t.payLater.example.rows[5].value}
            </div>
            <p className="text-xs text-muted">{t.mock.caption}</p>
          </Card>
        </div>
      </Section>

      {/* Audience */}
      <Section labelledBy="audience">
        <SectionHeading id="audience" eyebrow={h.audience.eyebrow} title={h.audience.title} lead={h.audience.lead} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {h.audience.items.map((it, i) => {
            const Icon = audienceIcons[i] ?? Building2;
            return (
              <Card key={it.title}>
                <IconBadge>
                  <Icon className="h-5 w-5" />
                </IconBadge>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8">
          <ButtonLink href={`/${locale}/use-cases`} tone="secondary" arrow>
            {t.nav.useCases}
          </ButtonLink>
        </div>
      </Section>

      {/* Honest */}
      <Section tone="card" labelledBy="honest">
        <SectionHeading id="honest" eyebrow={h.honest.eyebrow} title={h.honest.title} lead={h.honest.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {h.honest.items.map((it, i) => {
            const Icon = honestIcons[i];
            return (
              <Card key={it.title}>
                <div className="flex items-center gap-3">
                  <IconBadge>
                    <Icon className="h-5 w-5" />
                  </IconBadge>
                  <h3 className="font-display text-xl font-extrabold text-navy">{it.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{it.body}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8">
          <ButtonLink href={`/${locale}/security`} tone="secondary" arrow>
            {h.honest.cta}
          </ButtonLink>
        </div>
      </Section>

      {/* Surfaces */}
      <Section labelledBy="surfaces">
        <SectionHeading id="surfaces" eyebrow={h.surfaces.eyebrow} title={h.surfaces.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {h.surfaces.items.map((it, i) => {
            const Icon = surfaceIcons[i];
            return (
              <Card key={it.title} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <IconBadge>
                    <Icon className="h-5 w-5" />
                  </IconBadge>
                  <Pill tone="green">{it.status}</Pill>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8">
          <ButtonLink href={`/${locale}/product`} tone="secondary" arrow>
            {t.nav.product}
          </ButtonLink>
        </div>
      </Section>

      {/* Coverage */}
      <Section tone="card" labelledBy="coverage">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading id="coverage" eyebrow={h.coverage.eyebrow} title={h.coverage.title} lead={h.coverage.body} />
            <p className="mt-4 text-sm text-muted">{h.coverage.note}</p>
            <div className="mt-8">
              <ButtonLink href={`/${locale}/coverage`} arrow>
                {h.coverage.cta}
              </ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              [countries.length, h.coverage.countries],
              [SUPPORTED_CURRENCIES.length, h.coverage.currencies],
              [regions, h.coverage.regions],
            ].map(([n, label]) => (
              <Card key={label} className="p-5 text-center sm:p-6">
                <p className="tabular font-display text-4xl font-black text-green sm:text-5xl">{n}</p>
                <p className="mt-2 text-xs font-semibold leading-snug text-muted sm:text-sm">{label}</p>
              </Card>
            ))}
          </div>
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

import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { StackCards } from "@/components/site/StackCards";
import { ButtonLink, Card, CtaBand, PageHero, Pill, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { photos } from "@/lib/photos";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">) {
  return siteMetadata(params, "pricing", "pricing");
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.pricing;

  return (
    <>
      <PageHero title={p.hero.title} lead={p.hero.lead} photos={[photos.shop, photos.stall]} />

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {p.plans.map((plan, i) => {
            const featured = plan.featured !== "";
            return (
              <div
                key={plan.name}
                className={`flex flex-col rounded-3xl border p-6 sm:p-8 ${featured ? "border-green bg-card ring-2 ring-green" : "border-line bg-card"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-medium text-navy">{plan.name}</h2>
                  {featured && <Pill>{plan.featured}</Pill>}
                </div>
                <p className="mt-4 font-display text-xl font-medium text-green">{plan.price}</p>
                <p className="text-sm text-muted">{plan.note}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink">{plan.body}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-relaxed">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={`/${locale}/contact`}
                  tone={featured || i === 0 ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </ButtonLink>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="card" labelledBy="model">
        <SectionHeading id="model" title={p.model.title} lead={p.model.lead} />
        <StackCards
          items={p.model.items.map((it, i) => ({
            title: it.title,
            body: it.body,
            visual: (["integrate", "platform", "usage", "support"] as const)[i] ?? "platform",
          }))}
        />
      </Section>

      <Section labelledBy="faq">
        <SectionHeading id="faq" title={p.faq.title} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.faq.items.map((f) => (
            <Card key={f.q}>
              <h3 className="font-display text-base font-medium text-navy">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </Card>
          ))}
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

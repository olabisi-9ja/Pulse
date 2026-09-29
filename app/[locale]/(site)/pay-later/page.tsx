import { Gauge, Scale, ShieldCheck, UserCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { StackCards } from "@/components/site/StackCards";
import { ButtonLink, Card, CheckList, CtaBand, IconBadge, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { photos } from "@/lib/photos";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/pay-later">) {
  return siteMetadata(params, "payLater", "pay-later");
}

const limitIcons = [UserCheck, Gauge, Scale];

export default async function PayLaterPage({ params }: PageProps<"/[locale]/pay-later">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.payLater;

  return (
    <>
      <PageHero title={p.hero.title} lead={p.hero.lead} photos={[photos.stall, photos.trader]}>
        <ButtonLink href={`/${locale}/contact`} arrow>
          {t.common.requestPilot}
        </ButtonLink>
      </PageHero>

      <Section labelledBy="how">
        <SectionHeading id="how" title={p.how.title} />
        <StackCards
          items={p.how.steps.map((s, i) => ({ title: s.title, body: s.body, visual: (["extend", "sign", "loan", "repay"] as const)[i] ?? "loan" }))}
        />
      </Section>

      <Section tone="card" labelledBy="example">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading id="example" title={p.example.title} lead={p.example.note} />
          <div className="rounded-3xl border border-line bg-card">
            <dl className="divide-y divide-line">
              {p.example.rows.map((r, i) => {
                const last = i === p.example.rows.length - 1;
                return (
                  <div
                    key={r.label}
                    className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${last ? "rounded-b-3xl bg-green-soft" : ""}`}
                  >
                    <dt className={`text-sm ${last ? "font-bold text-green" : "text-muted"}`}>{r.label}</dt>
                    <dd className={`tabular font-display font-medium text-navy ${last ? "text-base sm:max-w-[60%] sm:text-right" : "text-lg"}`}>
                      {r.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </Section>

      <Section labelledBy="limit">
        <SectionHeading id="limit" title={p.limit.title} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.limit.items.map((it, i) => {
            const Icon = limitIcons[i];
            return (
              <Card key={it.title}>
                <IconBadge>
                  <Icon className="h-5 w-5" />
                </IconBadge>
                <h3 className="mt-4 font-display text-lg font-medium text-navy">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="card" labelledBy="guardrails">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading id="guardrails" title={p.guardrails.title} />
          <div className="flex gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-green" aria-hidden />
            <CheckList items={p.guardrails.items} />
          </div>
        </div>
      </Section>

      <Section labelledBy="lender">
        <div className="rounded-3xl border border-green bg-green-soft p-6 sm:p-8">
          <h2 id="lender" className="font-display text-2xl font-medium text-navy">
            {p.lender.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink">{p.lender.body}</p>
        </div>
      </Section>

      <CtaBand
        title={p.cta.title}
        body={p.cta.body}
        primary={{ href: `/${locale}/contact`, label: t.common.requestPilot }}
        secondary={{ href: `/${locale}/security`, label: t.footer.security }}
      />
    </>
  );
}

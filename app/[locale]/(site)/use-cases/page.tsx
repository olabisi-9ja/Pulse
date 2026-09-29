import { notFound } from "next/navigation";
import { siteMetadata } from "@/components/site/meta";
import { PhotoOrVisual } from "@/components/site/PhotoOrVisual";
import { CtaBand, PageHero, Section } from "@/components/site/ui";
import type { VignetteKind } from "@/components/site/Vignettes";
import { photos } from "@/lib/photos";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/use-cases">) {
  return siteMetadata(params, "useCases", "use-cases");
}

const PHOTOS = ["stall", "bank", "agent", "shop", "transit", "school", "trader", ""];
const VISUALS: VignetteKind[] = ["verify", "platform", "sync", "request", "scan", "usage", "extend", "integrate"];

export default async function UseCasesPage({ params }: PageProps<"/[locale]/use-cases">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.useCases;

  return (
    <>
      <PageHero title={p.hero.title} lead={p.hero.lead} photos={[photos.transit, photos.school]} />
      <Section>
        <ul className="space-y-20 sm:space-y-28">
          {p.cases.map((c, i) => (
            <li key={c.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <PhotoOrVisual
                photo={photos[PHOTOS[i]] ?? null}
                visual={VISUALS[i % VISUALS.length]}
                className={`aspect-[4/3] ${i % 2 ? "lg:order-2" : ""}`}
              />
              <div>
                <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1] text-navy text-balance">{c.title}</h2>
                <p className="mt-6 text-lg leading-relaxed text-ink sm:text-xl">{c.benefit}</p>
                <p className="mt-5 border-l-2 border-green pl-4 text-sm leading-relaxed text-muted">{c.scenario}</p>
              </div>
            </li>
          ))}
        </ul>
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

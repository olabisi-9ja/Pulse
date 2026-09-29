import { CalendarCheck, FlaskConical, Inbox } from "lucide-react";
import { notFound } from "next/navigation";
import { listCountries } from "@payvault/countries";
import { ContactForm } from "@/components/site/ContactForm";
import { siteMetadata } from "@/components/site/meta";
import { Container } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  return siteMetadata(params, "contact", "contact");
}

const asideIcons = [Inbox, CalendarCheck, FlaskConical];

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteMessages(locale);
  const p = t.contact;
  const countries = listCountries()
    .map((c) => ({ code: c.code, name: c.name[locale] }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  return (
    <div className="relative overflow-hidden">
      <Container className="relative grid gap-10 py-12 sm:py-20 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <header>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-navy">
            {p.hero.title.split("|").map((line, i) => (
              <span key={line} className={`block ${i ? "text-green" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">{p.hero.lead}</p>
          <div className="mt-10">
            <h2 className="font-display text-lg font-medium text-navy">{p.aside.title}</h2>
            <ol className="mt-4 space-y-4">
              {p.aside.items.map((it, i) => {
                const Icon = asideIcons[i];
                return (
                  <li key={it} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-soft text-green" aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{it}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </header>
        <ContactForm locale={locale} t={p.form} orgTypes={p.orgTypes} volumes={p.volumes} countries={countries} />
      </Container>
    </div>
  );
}

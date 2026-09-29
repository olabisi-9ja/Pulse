import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale, locales } from "@/lib/i18n";
import { getLegalMessages, type LegalDoc } from "@/messages/legal";
import { Container } from "./ui";

type Kind = "privacy" | "terms";

export async function legalMetadata(params: Promise<{ locale: string }>, kind: Kind): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const doc = getLegalMessages(locale)[kind];
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/${locale}/${kind}`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/${kind}`])) },
  };
}

/** Plain, readable legal document with a draft notice until counsel signs it off. */
export function LegalPage({ locale, kind }: { locale: Locale; kind: Kind }) {
  const t = getLegalMessages(locale);
  const doc: LegalDoc = t[kind];
  return (
    <Container className="py-14 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight text-navy sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-muted">
          {t.updatedLabel}: {doc.updated}
        </p>
        <p className="mt-6 rounded-2xl border border-line bg-warn-soft px-4 py-3 text-sm text-warn">{t.draft}</p>
        {doc.sections.map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="font-display text-xl font-medium text-navy">{s.title}</h2>
            {s.paras?.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-ink">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink marker:text-muted">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </Container>
  );
}

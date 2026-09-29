import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/lib/i18n";
import type { SiteMessages } from "@/messages/site";
import { Container } from "./ui";

export function Footer({ locale, t }: { locale: Locale; t: SiteMessages }) {
  const f = t.footer;
  const n = t.nav;
  const cols = [
    {
      title: f.productTitle,
      links: [
        [n.product, "product"],
        [n.howItWorks, "how-it-works"],
        [n.payLater, "pay-later"],
        [n.useCases, "use-cases"],
        [n.pricing, "pricing"],
      ],
    },
    {
      title: f.resourcesTitle,
      links: [
        [n.coverage, "coverage"],
        [n.developers, "developers"],
        [f.docs, "docs"],
        [f.security, "security"],
      ],
    },
    {
      title: f.companyTitle,
      links: [
        [f.about, "about"],
        [f.contact, "contact"],
        [n.openApp, "app"],
        [n.console, "console"],
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-line bg-card-2">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href={`/${locale}`} aria-label="PayVault">
              <Logo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{f.blurb}</p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">{f.disclaimer}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">{c.title}</h2>
                <ul className="mt-4 space-y-3">
                  {c.links.map(([label, slug]) => (
                    <li key={slug}>
                      <Link href={`/${locale}/${slug}`} className="text-sm text-ink hover:text-green hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{f.rights.replace("{year}", String(new Date().getFullYear()))}</span>
            <Link href={`/${locale}/privacy`} className="hover:text-green hover:underline">
              {f.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-green hover:underline">
              {f.terms}
            </Link>
          </p>
          <p>{f.status}</p>
        </div>
      </Container>
    </footer>
  );
}

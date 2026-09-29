import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Section({
  children,
  id,
  tone = "paper",
  className = "",
  labelledBy,
}: {
  children: ReactNode;
  id?: string;
  tone?: "paper" | "card";
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-14 sm:py-20 ${tone === "card" ? "border-y border-line bg-card-2" : ""} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-green ${className}`}>
      <span aria-hidden className="h-px w-8 bg-green" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2
        id={id}
        className="font-display text-3xl font-extrabold leading-[1.1] text-navy text-balance sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </div>
  );
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-colors";
const buttonTones = {
  primary: "bg-green text-on-accent hover:bg-green-strong",
  secondary: "border border-line bg-card text-navy hover:bg-card-2",
  inverse: "bg-on-accent text-navy hover:opacity-90",
  outlineInverse: "border border-on-accent/40 text-on-accent hover:bg-on-accent/10",
} as const;

export function ButtonLink({
  href,
  children,
  tone = "primary",
  arrow = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof buttonTones;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonBase} ${buttonTones[tone]} ${className}`}>
      {children}
      {arrow && <ArrowRight className="h-4 w-4" aria-hidden />}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</div>;
}

export function IconBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-soft text-green ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function Pill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "navy" | "muted" | "warn" }) {
  const tones = {
    green: "bg-green-soft text-green",
    navy: "bg-navy-soft text-navy",
    muted: "bg-card-2 text-muted border border-line",
    warn: "bg-warn-soft text-warn",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>
  );
}

export function CheckList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-sm leading-relaxed sm:text-base">
          <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Large faint shield watermark, placed behind hero content. */
export function Watermark({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute select-none opacity-[0.06] ${className}`}>
      <LogoMark className="h-full w-full" title="" />
    </div>
  );
}

/** Interior page hero: eyebrow, uppercase heading, lead. Renders the page's only h1. */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <Watermark className="-right-16 -top-10 h-[26rem] w-[25rem] sm:right-0 sm:h-[32rem] sm:w-[31rem]" />
      <Container className="relative pb-14 pt-12 sm:pb-20 sm:pt-20">
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl font-display text-4xl font-black uppercase leading-[1.02] text-navy text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lead}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </header>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-on-accent sm:p-14">
          <Watermark className="-right-10 -top-6 h-72 w-72 opacity-[0.1]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-balance sm:text-4xl">{title}</h2>
            <p className="mt-4 text-base leading-relaxed opacity-85 sm:text-lg">{body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={primary.href} tone="inverse" arrow>
                {primary.label}
              </ButtonLink>
              {secondary && (
                <ButtonLink href={secondary.href} tone="outlineInverse">
                  {secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Two-column table that stacks into labelled blocks on narrow screens. */
export function TwoColTable({
  head,
  rows,
  caption,
}: {
  head: [string, string];
  rows: readonly (readonly [string, string])[];
  caption: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only sm:table-header-group">
          <tr className="bg-card-2 text-xs uppercase tracking-wider text-muted">
            <th scope="col" className="px-6 py-3.5 font-bold sm:w-2/5">
              {head[0]}
            </th>
            <th scope="col" className="px-6 py-3.5 font-bold">
              {head[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="block border-t border-line first:border-t-0 sm:table-row">
              <th
                scope="row"
                data-label={head[0]}
                className="block px-5 pb-1 pt-4 font-semibold text-navy before:mb-0.5 before:block before:text-[0.65rem] before:font-bold before:uppercase before:tracking-wider before:text-muted before:content-[attr(data-label)] sm:table-cell sm:px-6 sm:py-4 sm:align-top sm:before:hidden"
              >
                {a}
              </th>
              <td
                data-label={head[1]}
                className="block px-5 pb-4 pt-1 text-muted before:mb-0.5 before:block before:text-[0.65rem] before:font-bold before:uppercase before:tracking-wider before:content-[attr(data-label)] sm:table-cell sm:px-6 sm:py-4 sm:align-top sm:before:hidden"
              >
                {b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

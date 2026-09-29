/** Server-safe building blocks for the docs pages. */
import Link from "next/link";
import type { ReactNode } from "react";
import type { Block, Callout as CalloutData, Table } from "@/messages/docs";

/** Renders `code` spans written with backticks inside plain strings. */
export function Rich({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <C key={i}>{part}</C>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Inline code. */
export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-line bg-card-2 px-1.5 py-0.5 font-mono text-[0.85em] break-words text-ink">
      {children}
    </code>
  );
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="mb-8 border-b border-line pb-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-green">{eyebrow}</p>
      <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-[72ch] text-lg leading-relaxed text-muted">
        <Rich text={lead} />
      </p>
    </header>
  );
}

export function EnglishOnly({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p
      lang="fr"
      className="mb-6 rounded-2xl border border-line bg-card-2 px-4 py-3 text-sm font-semibold text-navy"
    >
      {text}
    </p>
  );
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display mt-12 scroll-mt-24 text-2xl font-bold text-navy first:mt-0">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="font-display mt-8 scroll-mt-24 text-lg font-bold text-ink">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-[72ch] leading-relaxed text-ink/90">{children}</p>;
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-4 max-w-[72ch] list-disc space-y-2 pl-5 leading-relaxed text-ink/90 marker:text-green">{children}</ul>;
}

export function Ol({ children }: { children: ReactNode }) {
  return <ol className="mt-4 max-w-[72ch] list-decimal space-y-2 pl-5 leading-relaxed text-ink/90 marker:font-semibold marker:text-green">{children}</ol>;
}

const TONES = {
  note: "border-green/30 bg-green-soft text-green",
  warn: "border-warn/30 bg-warn-soft text-warn",
  danger: "border-danger/30 bg-danger-soft text-danger",
} as const;

export function Callout({ tone = "note", title, children }: { tone?: keyof typeof TONES; title: string; children: ReactNode }) {
  return (
    <aside className={`my-6 max-w-[72ch] rounded-2xl border px-4 py-3.5 ${TONES[tone]}`}>
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-1 text-sm leading-relaxed text-ink/90">{children}</div>
    </aside>
  );
}

export function CalloutData({ data }: { data: CalloutData }) {
  return (
    <Callout tone={data.tone} title={data.title}>
      <Rich text={data.body} />
    </Callout>
  );
}

/** A table that scrolls inside itself, never the page. */
export function DataTable({
  head,
  rows,
  caption,
  mono = [],
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  caption: string;
  /** Column indexes rendered in monospace. */
  mono?: number[];
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="my-5 max-w-full overflow-x-auto rounded-2xl border border-line bg-card"
    >
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-card-2">
            {head.map((h, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-3 py-2.5 align-top ${mono.includes(c) ? "whitespace-nowrap font-mono text-[0.8rem] tabular" : "min-w-40 max-w-md"}`}
                >
                  {typeof cell === "string" && !mono.includes(c) ? <Rich text={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableData({ data, caption }: { data: Table; caption: string }) {
  return <DataTable head={data.head} rows={data.rows} caption={caption} />;
}

const METHODS = {
  GET: "bg-navy-soft text-navy",
  POST: "bg-green-soft text-green",
} as const;

/** Heading for one API endpoint. */
export function Endpoint({
  id,
  method,
  path,
  summary,
  auth = "Bearer API key",
  children,
}: {
  id: string;
  method: keyof typeof METHODS;
  path: string;
  summary: string;
  auth?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 border-t border-line pt-8 first-of-type:border-0 first-of-type:pt-0">
      <h3 id={id} className="scroll-mt-24">
        <span className="flex flex-wrap items-center gap-2.5">
          <span className={`rounded-md px-2 py-1 font-mono text-xs font-bold ${METHODS[method]}`}>{method}</span>
          <code className="min-w-0 break-all font-mono text-base font-bold text-ink">{path}</code>
        </span>
      </h3>
      <p className="mt-3 max-w-[72ch] leading-relaxed text-ink/90">{summary}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Auth: {auth}</p>
      {children}
    </section>
  );
}

/** Renders message blocks (used by the Introduction and Concepts pages). */
export function Blocks({ blocks, prefix = "" }: { blocks: Block[]; prefix?: string }) {
  return (
    <>
      {blocks.map((b) => (
        <section key={b.id} aria-labelledby={`${prefix}${b.id}`}>
          <H2 id={`${prefix}${b.id}`}>{b.title}</H2>
          {b.paras?.map((p, i) => (
            <P key={i}>
              <Rich text={p} />
            </P>
          ))}
          {b.bullets && (
            <Ul>
              {b.bullets.map((x, i) => (
                <li key={i}>
                  <Rich text={x} />
                </li>
              ))}
            </Ul>
          )}
          {b.table && <TableData data={b.table} caption={b.title} />}
          {b.callout && <CalloutData data={b.callout} />}
        </section>
      ))}
    </>
  );
}

export function CardLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-line bg-card p-4 transition-colors hover:bg-card-2"
    >
      <span className="font-display block text-base font-bold text-navy">{title}</span>
      <span className="mt-1 block text-sm text-muted">{body}</span>
    </Link>
  );
}

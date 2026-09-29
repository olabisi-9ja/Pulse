import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { type Money, money } from "@/lib/console/format";
import type { ConsoleMessages } from "@/messages/console";

export const inputCls =
  "min-h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink placeholder:text-muted focus:border-green disabled:opacity-60";
export const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-on-accent hover:bg-green-strong disabled:opacity-60";
export const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-card-2 disabled:opacity-60";
export const btnDanger =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 text-sm font-semibold text-danger hover:opacity-90 disabled:opacity-60";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({
  title,
  hint,
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes body padding, for tables. */
  flush?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-card ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="font-display text-base font-bold text-ink">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? "mt-3" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export function Kpi({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="tabular mt-2 font-display text-2xl font-bold text-ink">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const tones = {
  neutral: "bg-card-2 text-muted border-line",
  green: "bg-green-soft text-green border-transparent",
  navy: "bg-navy-soft text-navy border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
} as const;
export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const statusTone: Record<string, Tone> = {
  active: "green",
  settled: "green",
  repaid: "green",
  recovered: "green",
  tier2: "green",
  closing: "warn",
  open: "warn",
  flagged: "danger",
  overdue: "danger",
  revoked: "danger",
  frozen: "danger",
  written_off: "neutral",
  closed: "neutral",
  retired: "neutral",
  tier0: "neutral",
  tier1: "navy",
};

export function Status({ value, labels }: { value: string; labels: Record<string, string> }) {
  return <Badge tone={statusTone[value] ?? "neutral"}>{labels[value] ?? value}</Badge>;
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-card-2 text-muted">
        <Inbox className="h-5 w-5" aria-hidden />
      </span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Horizontally scrollable table inside its card, so the page itself never scrolls sideways. */
export function DataTable({ head, children, label }: { head: ReactNode[]; children: ReactNode; label?: string }) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-y border-line bg-card-2 text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 font-semibold first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const tdCls = "whitespace-nowrap px-4 py-3 align-middle first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";

export function Td({ children, num = false, className = "" }: { children?: ReactNode; num?: boolean; className?: string }) {
  return <td className={`${tdCls} ${num ? "tabular text-right" : ""} ${className}`}>{children}</td>;
}

export function Mono({ children }: { children: ReactNode }) {
  return <code className="rounded bg-card-2 px-1.5 py-0.5 font-mono text-xs text-ink">{children}</code>;
}

export function MoneyList({ items, locale, empty = "–" }: { items: Money[]; locale: Locale; empty?: string }) {
  if (!items.length) return <span className="text-muted">{empty}</span>;
  return (
    <span className="flex flex-col gap-0.5">
      {items.map((m) => (
        <span key={m.currency}>{money(m.amount, m.currency, locale)}</span>
      ))}
    </span>
  );
}

export function Pager({
  page,
  pages,
  total,
  hrefFor,
  t,
}: {
  page: number;
  pages: number;
  total: number;
  hrefFor: (page: number) => string;
  t: ConsoleMessages["common"];
}) {
  const link =
    "inline-flex min-h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink hover:bg-card-2";
  const off = "inline-flex min-h-9 items-center gap-1 rounded-lg border border-line px-3 text-sm text-muted opacity-50";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
      <p className="tabular text-xs text-muted">
        {fmt(t.results, { n: total })} · {fmt(t.pageOf, { page, pages })}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={link}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t.previous}
          </Link>
        ) : (
          <span className={off}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t.previous}
          </span>
        )}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className={link}>
            {t.next}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={off}>
            {t.next}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}

/** GET filter form: works without JavaScript and keeps the selected partner in the URL. */
export function FilterForm({
  partnerId,
  showPartner,
  children,
  t,
}: {
  partnerId: string;
  showPartner: boolean;
  children: ReactNode;
  t: ConsoleMessages["common"];
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3 px-4 pt-4 sm:px-5">
      {showPartner && <input type="hidden" name="p" value={partnerId} />}
      {children}
      <button type="submit" className={btnSecondary}>
        {t.apply}
      </button>
    </form>
  );
}

export function FilterSelect({
  name,
  label,
  value,
  options,
  all,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  all: string;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-1 text-xs font-semibold text-muted">
      {label}
      <select name={name} defaultValue={value ?? ""} className={inputCls}>
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ReadOnlyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-card-2 px-3 py-2 text-xs text-muted">{children}</p>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function DefList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{i.label}</dt>
          <dd className="tabular mt-0.5 break-words text-sm text-ink">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

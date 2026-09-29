import { formatMinor } from "@payvault/countries";
import type { Locale } from "@/lib/i18n";

export type Money = { currency: string; amount: number };

/** Formats minor units; falls back to a plain number for currencies without a pack. */
export function money(amount: number, currency: string, locale: Locale): string {
  try {
    return formatMinor(amount, currency, locale);
  } catch {
    return `${new Intl.NumberFormat(locale).format(amount / 100)} ${currency}`;
  }
}

export function dateTime(d: Date | string | null | undefined, locale: Locale): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(d)) + " UTC";
}

export function dateOnly(d: Date | string | null | undefined, locale: Locale): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

export const num = (n: number, locale: Locale, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(locale, opts).format(n);

export const pct = (ratio: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(ratio);

export function duration(seconds: number, locale: Locale): string {
  const day = locale === "fr" ? "j" : "d";
  if (seconds < 90) return `${num(Math.round(seconds), locale)} s`;
  if (seconds < 5400) return `${num(Math.round(seconds / 60), locale)} min`;
  if (seconds < 172800) return `${num(Math.round(seconds / 3600), locale, { maximumFractionDigits: 1 })} h`;
  return `${num(Math.round(seconds / 86400), locale, { maximumFractionDigits: 1 })} ${day}`;
}

export const short = (hex: string, n = 8) => (hex.length > n ? `${hex.slice(0, n)}…` : hex);

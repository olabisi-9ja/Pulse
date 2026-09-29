import { formatMinor, SUPPORTED_CURRENCIES } from "@payvault/countries";
import type { Locale } from "@/lib/i18n";

export function minorUnitsOf(currency: string): number {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.minorUnits ?? 2;
}

export function money(amountMinor: number, currency: string, locale: Locale): string {
  try {
    return formatMinor(amountMinor, currency, locale);
  } catch {
    return `${(amountMinor / 10 ** minorUnitsOf(currency)).toFixed(minorUnitsOf(currency))} ${currency}`;
  }
}

/** Parses what a person typed ("1,500.50", "1 500,50") into minor units. */
export function parseMajor(input: string, currency: string): number | null {
  const units = minorUnitsOf(currency);
  let s = input.replace(/[\s  ]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  // The last separator is decimal if it has at most `units` digits after it.
  const idx = Math.max(lastComma, lastDot);
  if (idx >= 0 && s.length - idx - 1 <= units && units > 0) {
    s = s.slice(0, idx).replace(/[.,]/g, "") + "." + s.slice(idx + 1);
  } else {
    s = s.replace(/[.,]/g, "");
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const v = Math.round(Number(s) * 10 ** units);
  return Number.isSafeInteger(v) && v > 0 ? v : null;
}

export function shortDate(ts: number | string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(ts),
  );
}

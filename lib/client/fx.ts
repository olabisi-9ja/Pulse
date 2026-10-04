/** Display-only currency conversion from the cached reference rates. */
import type { Locale } from "@/lib/i18n";
import { minorUnitsOf } from "./money";

export type RatesTable = { perUsd: Record<string, number>; asOf: number; source: "live" | "fallback" };

/** Converts minor units of `from` into a major amount of `to`, or null if a rate is missing. */
export function convert(amountMinor: number, from: string, to: string, rates: RatesTable | undefined): number | null {
  const a = rates?.perUsd[from];
  const b = rates?.perUsd[to];
  if (!a || !b) return null;
  return (amountMinor / 10 ** minorUnitsOf(from)) * (b / a);
}

/** "≈ €12.34", or null when there is nothing useful to show. */
export function approx(amountMinor: number, from: string, to: string | null, rates: RatesTable | undefined, locale: Locale): string | null {
  if (!to || to === from) return null;
  const v = convert(amountMinor, from, to, rates);
  if (v === null) return null;
  try {
    return "≈ " + new Intl.NumberFormat(locale, { style: "currency", currency: to, maximumFractionDigits: v >= 100 ? 0 : 2 }).format(v);
  } catch {
    return `≈ ${v.toFixed(2)} ${to}`;
  }
}

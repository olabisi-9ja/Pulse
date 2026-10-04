import "server-only";
/**
 * Reference exchange rates for showing balances in another currency. Display
 * only: money never moves at these rates. Cached per server instance; the app
 * keeps the last copy in its snapshot so conversion works offline.
 */
import { SUPPORTED_CURRENCIES } from "@payvault/countries";

export type Rates = {
  /** Units of each currency per 1 USD. */
  perUsd: Record<string, number>;
  /** Unix seconds the provider last updated. */
  asOf: number;
  source: "live" | "fallback";
};

/** XOF and XAF are pegged to the euro at a fixed rate. */
export const CFA_PER_EUR = 655.957;

export const DISPLAY_CURRENCIES = [
  ...new Set(["USD", "EUR", "GBP", "CNY", ...SUPPORTED_CURRENCIES.map((c) => c.code)]),
];

// Rough values used only if the provider is unreachable on a cold start.
const FALLBACK: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, CNY: 7.2, NGN: 1500, GHS: 15, KES: 129, UGX: 3700, TZS: 2600, RWF: 1400,
  ETB: 120, ZAR: 18, EGP: 48, MAD: 9.8,
};

const TTL_MS = 6 * 3600_000;
let cached: { rates: Rates; at: number } | null = null;

function withPegs(perUsd: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of DISPLAY_CURRENCIES) if (perUsd[c] > 0) out[c] = perUsd[c];
  if (out.EUR) out.XOF = out.XAF = out.EUR * CFA_PER_EUR;
  return out;
}

export async function getRates(): Promise<Rates> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.rates;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000), cache: "no-store" });
    const body = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
    if (body.result !== "success" || !body.rates) throw new Error("bad rates response");
    const rates: Rates = { perUsd: withPegs(body.rates), asOf: body.time_last_update_unix ?? Math.floor(Date.now() / 1000), source: "live" };
    cached = { rates, at: Date.now() };
    return rates;
  } catch {
    // Keep serving the last good copy; otherwise the rough table, retried in a minute.
    if (cached) return cached.rates;
    const rates: Rates = { perUsd: withPegs(FALLBACK), asOf: 0, source: "fallback" };
    cached = { rates, at: Date.now() - TTL_MS + 60_000 };
    return rates;
  }
}

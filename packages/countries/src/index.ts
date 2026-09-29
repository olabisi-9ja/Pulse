import { CountryPackSchema, type CountryPack, type Currency } from "./schema";
import { ng } from "./packs/ng";
import { gh } from "./packs/gh";
import { ke } from "./packs/ke";
import { sn } from "./packs/sn";
import { ci } from "./packs/ci";
import { cm } from "./packs/cm";
import { rw } from "./packs/rw";
import { za } from "./packs/za";
import { eg } from "./packs/eg";
import { tz } from "./packs/tz";
import { ug } from "./packs/ug";
import { et } from "./packs/et";
import { bj } from "./packs/bj";
import { tg } from "./packs/tg";
import { ma } from "./packs/ma";

export * from "./schema";

export type Locale = "en" | "fr";

export interface CountrySummary {
  code: string;
  name: CountryPack["name"];
  region: CountryPack["region"];
  bloc: CountryPack["bloc"];
  currencyCode: string;
  status: CountryPack["status"];
}

/** Parses every pack at module load; throws on an invalid or duplicate pack. */
function loadPacks(raw: readonly unknown[]): readonly CountryPack[] {
  const packs = raw.map((pack, i) => {
    const result = CountryPackSchema.safeParse(pack);
    if (!result.success) {
      const code = (pack as { code?: unknown } | null)?.code ?? `#${i}`;
      throw new Error(`Invalid country pack ${String(code)}: ${result.error.message}`);
    }
    return result.data;
  });

  const seen = new Set<string>();
  for (const { code } of packs) {
    if (seen.has(code)) throw new Error(`Duplicate country pack: ${code}`);
    seen.add(code);
  }
  return packs;
}

export const countryPacks: readonly CountryPack[] = loadPacks([
  ng, gh, ke, sn, ci, cm, rw, za, eg, tz, ug, et, bj, tg, ma,
]);

const packsByCode = new Map(countryPacks.map((p) => [p.code, p]));

/** Distinct currencies across packs (shared ones, e.g. XOF, appear once). */
function collectCurrencies(packs: readonly CountryPack[]): readonly Currency[] {
  const byCode = new Map<string, Currency>();
  for (const { currency } of packs) {
    const existing = byCode.get(currency.code);
    if (existing && existing.minorUnits !== currency.minorUnits) {
      throw new Error(`Conflicting minorUnits for ${currency.code}`);
    }
    if (!existing) byCode.set(currency.code, currency);
  }
  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export const SUPPORTED_CURRENCIES: readonly Currency[] = collectCurrencies(countryPacks);

const currenciesByCode = new Map(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));

export function getCountryPack(code: string): CountryPack | undefined {
  return packsByCode.get(code.toUpperCase());
}

export function listCountries(): CountrySummary[] {
  return countryPacks.map((p) => ({
    code: p.code,
    name: p.name,
    region: p.region,
    bloc: p.bloc,
    currencyCode: p.currency.code,
    status: p.status,
  }));
}

export function currencyForCountry(code: string): Currency | undefined {
  return getCountryPack(code)?.currency;
}

function requireCurrency(currencyCode: string): Currency {
  const currency = currenciesByCode.get(currencyCode.toUpperCase());
  if (!currency) throw new Error(`Unsupported currency: ${currencyCode}`);
  return currency;
}

/** Formats an integer amount in minor units, e.g. formatMinor(150000, "NGN", "en"). */
export function formatMinor(amountMinor: number, currencyCode: string, locale: Locale): string {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("amountMinor must be a safe integer");
  const { code, minorUnits } = requireCurrency(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: minorUnits,
    maximumFractionDigits: minorUnits,
  }).format(amountMinor / 10 ** minorUnits);
}

/** Converts a major-unit amount (e.g. 1500.5) to integer minor units, rounding half away from zero. */
export function toMinor(major: number, currencyCode: string): number {
  if (!Number.isFinite(major)) throw new Error("major must be a finite number");
  const { minorUnits } = requireCurrency(currencyCode);
  // toPrecision(15) strips binary noise such as 1.005 * 100 = 100.49999999999999.
  const scaled = Number((Math.abs(major) * 10 ** minorUnits).toPrecision(15));
  return Math.sign(major) * Math.round(scaled) || 0;
}

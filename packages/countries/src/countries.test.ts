import { describe, expect, it } from "vitest";
import {
  CountryPackSchema,
  SUPPORTED_CURRENCIES,
  countryPacks,
  currencyForCountry,
  formatMinor,
  getCountryPack,
  listCountries,
  toMinor,
} from "./index";

const EXPECTED_CODES = ["NG", "GH", "KE", "SN", "CI", "CM", "RW", "ZA", "EG", "TZ", "UG", "ET", "BJ", "TG", "MA"];

describe("country packs", () => {
  it("includes the expected 15 countries", () => {
    expect(countryPacks.map((p) => p.code).sort()).toEqual([...EXPECTED_CODES].sort());
  });

  it.each(countryPacks.map((p) => [p.code, p] as const))("%s validates", (_code, pack) => {
    expect(CountryPackSchema.safeParse(pack).success).toBe(true);
    expect(pack.status).toBe("concept");
  });

  it("has unique codes", () => {
    const codes = countryPacks.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps offline limits consistent", () => {
    for (const { code, offlineLimits: l, kyc } of countryPacks) {
      expect(l.perTransaction, code).toBeLessThanOrEqual(l.allowanceCap);
      expect(l.maxPaymentsPerAllowance, code).toBeLessThanOrEqual(65535);
      expect(l.allowanceTtlHours, code).toBe(72);
      expect(kyc.tiers.at(-1)?.allowanceCapMultiplier, code).toBe(1);
    }
  });

  it("uses zero minor units for XOF, XAF, RWF and UGX", () => {
    for (const c of ["XOF", "XAF", "RWF", "UGX"]) {
      expect(SUPPORTED_CURRENCIES.find((x) => x.code === c)?.minorUnits).toBe(0);
    }
  });

  it("looks packs up case-insensitively", () => {
    expect(getCountryPack("ng")?.name.en).toBe("Nigeria");
    expect(getCountryPack("XX")).toBeUndefined();
    expect(currencyForCountry("SN")?.code).toBe("XOF");
    expect(listCountries()).toHaveLength(15);
  });
});

describe("money helpers", () => {
  it("formats NGN", () => {
    expect(formatMinor(150_000, "NGN", "en")).toMatch(/^NGN\s1,500\.00$/);
    expect(formatMinor(150_000, "NGN", "fr")).toMatch(/^1\s?500,00\s?NGN$/);
  });

  it("formats XOF with no decimals", () => {
    expect(formatMinor(7_500, "XOF", "en")).toMatch(/7,500$/);
    expect(formatMinor(7_500, "XOF", "fr")).toMatch(/^7\s?500\s/);
    expect(formatMinor(7_500, "XOF", "en")).not.toContain(".");
  });

  it("formats KES", () => {
    expect(formatMinor(500_000, "KES", "en")).toMatch(/^KES\s5,000\.00$/);
    expect(formatMinor(500_000, "KES", "fr")).toMatch(/^5\s?000,00\s?KES$/);
  });

  it("rejects unsupported currencies", () => {
    expect(() => formatMinor(100, "USD", "en")).toThrow(/Unsupported currency/);
  });

  it("converts to minor units", () => {
    expect(toMinor(1500.5, "NGN")).toBe(150_050);
    expect(toMinor(1.005, "KES")).toBe(101);
    expect(toMinor(7500, "XOF")).toBe(7_500);
    expect(toMinor(0, "XOF")).toBe(0);
  });
});

describe("schema rejection", () => {
  const base = getCountryPack("NG")!;
  const clone = () => structuredClone(base);

  it("rejects perTransaction above allowanceCap", () => {
    const bad = clone();
    bad.offlineLimits.perTransaction = bad.offlineLimits.allowanceCap + 1;
    expect(CountryPackSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects minorUnits inconsistent with the currency", () => {
    const bad = clone();
    bad.currency.minorUnits = 0;
    expect(CountryPackSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects malformed codes and out-of-range values", () => {
    expect(CountryPackSchema.safeParse({ ...clone(), code: "ng" }).success).toBe(false);
    const bad = clone();
    bad.offlineLimits.maxPaymentsPerAllowance = 70_000;
    expect(CountryPackSchema.safeParse(bad).success).toBe(false);
    const badTier = clone();
    badTier.kyc.tiers[0].allowanceCapMultiplier = 1.5;
    expect(CountryPackSchema.safeParse(badTier).success).toBe(false);
  });
});

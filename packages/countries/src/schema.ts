import { z } from "zod";

/** Bilingual text (English / French). */
const Localized = z.object({
  en: z.string().min(1),
  fr: z.string().min(1),
});

const minorInt = z.number().int().positive();

export const REGIONS = ["west", "east", "central", "southern", "north"] as const;
export const RAIL_TYPES = ["rtgs", "instant", "mobile_money", "card", "ach"] as const;
export const KYC_TIER_IDS = ["tier0", "tier1", "tier2"] as const;
export const PACK_STATUSES = ["concept", "pilot_ready", "live"] as const;
export const RESIDENCY_LEVELS = ["none", "preferred", "required"] as const;

const KycTier = z.object({
  id: z.enum(KYC_TIER_IDS),
  label: Localized,
  /** Share of `offlineLimits.allowanceCap` permitted at this tier (0..1). */
  allowanceCapMultiplier: z.number().min(0).max(1),
});

const Rail = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "rail id must be lowercase kebab-case"),
  name: z.string().min(1),
  type: z.enum(RAIL_TYPES),
});

/** Number of minor units ISO 4217 / ICU assigns to a currency (2 when unknown). */
export function isoMinorUnits(currencyCode: string): number {
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency: currencyCode }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export const CountryPackSchema = z
  .object({
    code: z.string().regex(/^[A-Z]{2}$/, "ISO 3166-1 alpha-2, uppercase"),
    name: Localized,
    region: z.enum(REGIONS),
    bloc: z
      .string()
      .regex(/^[A-Z][A-Z0-9-]+$/, "bloc must be an uppercase acronym")
      .nullable(),
    centralBank: z.object({
      name: z.string().min(1),
      abbreviation: z.string().min(1),
      url: z.url(),
    }),
    currency: z.object({
      code: z.string().regex(/^[A-Z]{3}$/, "ISO 4217 alphabetic code"),
      minorUnits: z.number().int().min(0).max(3),
      symbol: z.string().min(1),
      name: Localized,
    }),
    /** All amounts are integers in currency MINOR units. */
    offlineLimits: z.object({
      perTransaction: minorInt,
      allowanceCap: minorInt,
      allowanceTtlHours: z.number().int().positive(),
      maxPaymentsPerAllowance: z.number().int().min(1).max(65535),
      releaseGraceHours: z.number().int().nonnegative(),
    }),
    kyc: z.object({
      tiers: z.array(KycTier).min(1),
      idSystems: z.array(z.string().min(1)),
    }),
    rails: z.object({
      domestic: z.array(Rail).min(1),
      crossBorder: z.array(z.string().min(1)),
    }),
    languages: z.array(z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/, "BCP-47 tag")).min(1),
    phone: z.object({
      countryCode: z.string().regex(/^\+\d{1,3}$/),
      example: z.string().min(1),
    }),
    dataProtection: z.object({
      law: z.string().min(1),
      authority: z.string().min(1),
      residency: z.enum(RESIDENCY_LEVELS),
    }),
    status: z.enum(PACK_STATUSES),
    notes: Localized,
  })
  .superRefine((pack, ctx) => {
    const { offlineLimits, currency, kyc, rails, phone } = pack;

    if (offlineLimits.perTransaction > offlineLimits.allowanceCap) {
      ctx.addIssue({
        code: "custom",
        path: ["offlineLimits", "perTransaction"],
        message: "perTransaction must be <= allowanceCap",
      });
    }

    const expected = isoMinorUnits(currency.code);
    if (currency.minorUnits !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["currency", "minorUnits"],
        message: `${currency.code} has ${expected} minor units, got ${currency.minorUnits}`,
      });
    }

    const tierIds = kyc.tiers.map((t) => t.id);
    if (new Set(tierIds).size !== tierIds.length) {
      ctx.addIssue({ code: "custom", path: ["kyc", "tiers"], message: "duplicate KYC tier id" });
    }
    const sorted = [...kyc.tiers].sort((a, b) => a.id.localeCompare(b.id));
    if (sorted.some((t, i) => i > 0 && t.allowanceCapMultiplier < sorted[i - 1].allowanceCapMultiplier)) {
      ctx.addIssue({
        code: "custom",
        path: ["kyc", "tiers"],
        message: "allowanceCapMultiplier must not decrease as the tier rises",
      });
    }

    const railIds = rails.domestic.map((r) => r.id);
    if (new Set(railIds).size !== railIds.length) {
      ctx.addIssue({ code: "custom", path: ["rails", "domestic"], message: "duplicate rail id" });
    }

    if (!phone.example.startsWith(phone.countryCode)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone", "example"],
        message: `example must start with ${phone.countryCode}`,
      });
    }
  });

export type CountryPack = z.infer<typeof CountryPackSchema>;
export type Currency = CountryPack["currency"];
export type Region = (typeof REGIONS)[number];
export type PackStatus = (typeof PACK_STATUSES)[number];

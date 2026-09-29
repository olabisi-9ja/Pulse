/**
 * Limits policy. Country packs set the ceiling; KYC tier and credit history
 * decide what one person gets. Pure functions, so they are easy to test and
 * to explain to a regulator.
 */
import { type CountryPack, getCountryPack } from "@payvault/countries";

export type KycTier = "tier0" | "tier1" | "tier2";

export function packFor(country: string): CountryPack {
  const pack = getCountryPack(country);
  if (!pack) throw new Error(`Unsupported country ${country}`);
  return pack;
}

function tierMultiplier(pack: CountryPack, tier: KycTier): number {
  return pack.kyc.tiers.find((t) => t.id === tier)?.allowanceCapMultiplier ?? 0;
}

/** Most value a person can lock into one offline vault. */
export function maxFunded(pack: CountryPack, tier: KycTier): number {
  return Math.floor(pack.offlineLimits.allowanceCap * tierMultiplier(pack, tier));
}

/** Country ceiling for an offline overdraft line: 40% of the allowance cap. */
export function creditCeiling(pack: CountryPack): number {
  return Math.floor(pack.offlineLimits.allowanceCap * 0.4);
}

export type CreditHistory = {
  tier: KycTier;
  accountAgeDays: number;
  loansRepaidOnTime: number;
  loansRepaidLate: number;
  openOverdue: number;
  fraudCases: number;
  settledPayments: number;
};

/**
 * Score 0–100 and the resulting overdraft limit. Unverified users (tier0)
 * get no credit: lending requires KYC.
 */
export function creditDecision(pack: CountryPack, h: CreditHistory): { score: number; limit: number; reason: string } {
  if (h.fraudCases > 0) return { score: 0, limit: 0, reason: "fraud" };
  if (h.openOverdue > 0) return { score: 0, limit: 0, reason: "overdue" };
  if (h.tier === "tier0") return { score: 0, limit: 0, reason: "kyc_required" };

  let score = h.tier === "tier2" ? 45 : 30;
  score += Math.min(15, Math.floor(h.accountAgeDays / 7));
  score += Math.min(30, h.loansRepaidOnTime * 6);
  score += Math.min(10, Math.floor(h.settledPayments / 5));
  score -= h.loansRepaidLate * 10;
  score = Math.max(0, Math.min(100, score));

  const tierShare = h.tier === "tier2" ? 1 : 0.5;
  const limit = Math.floor((creditCeiling(pack) * tierShare * score) / 100);
  return { score, limit: roundDown(limit, pack.currency.minorUnits), reason: "ok" };
}

/** Rounds to a whole major unit so limits read cleanly. */
function roundDown(minor: number, minorUnits: number): number {
  const unit = 10 ** minorUnits;
  return Math.floor(minor / unit) * unit;
}

export function loanFee(principal: number, feeBps: number): number {
  return Math.ceil((principal * feeBps) / 10_000);
}

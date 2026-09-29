import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const gh: CountryPack = {
  code: "GH",
  name: { en: "Ghana", fr: "Ghana" },
  region: "west",
  bloc: "ECOWAS",
  centralBank: { name: "Bank of Ghana", abbreviation: "BoG", url: "https://www.bog.gov.gh" },
  currency: {
    code: "GHS",
    minorUnits: 2,
    symbol: "GH₵",
    name: { en: "Ghanaian cedi", fr: "cedi ghanéen" },
  },
  // Illustrative: cap ~GHS 500 (~USD 40), per-transaction ~GHS 150 (~USD 12).
  offlineLimits: {
    perTransaction: 15_000,
    allowanceCap: 50_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["Ghana Card"] },
  rails: {
    domestic: [
      { id: "gip", name: "GhIPSS Instant Pay (GIP)", type: "instant" },
      { id: "ghipss-rtgs", name: "GhIPSS RTGS", type: "rtgs" },
      { id: "ghipss-ach", name: "GhIPSS ACH", type: "ach" },
      { id: "gh-link", name: "gh-link", type: "card" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "telecel-cash", name: "Telecel Cash", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["en", "ak", "ee"],
  phone: { countryCode: "+233", example: "+233 24 123 4567" },
  dataProtection: {
    law: "Data Protection Act, 2012 (Act 843)",
    authority: "Data Protection Commission",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; strong mobile money and GIP interoperability.",
    fr: "Pack conceptuel illustratif ; forte interopérabilité mobile money et GIP.",
  },
};

import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const tz: CountryPack = {
  code: "TZ",
  name: { en: "Tanzania", fr: "Tanzanie" },
  region: "east",
  bloc: "EAC",
  centralBank: { name: "Bank of Tanzania", abbreviation: "BoT", url: "https://www.bot.go.tz" },
  currency: {
    code: "TZS",
    minorUnits: 2,
    symbol: "TSh",
    name: { en: "Tanzanian shilling", fr: "shilling tanzanien" },
  },
  // Illustrative: cap ~TZS 100,000 (~USD 40), per-transaction ~TZS 30,000 (~USD 12).
  offlineLimits: {
    perTransaction: 3_000_000,
    allowanceCap: 10_000_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["NIDA National ID"] },
  rails: {
    domestic: [
      { id: "tips", name: "TIPS", type: "instant" },
      { id: "tiss", name: "TISS", type: "rtgs" },
      { id: "tach", name: "TACH", type: "ach" },
      { id: "mpesa", name: "M-Pesa", type: "mobile_money" },
      { id: "mixx", name: "Mixx by Yas", type: "mobile_money" },
      { id: "airtel-money", name: "Airtel Money", type: "mobile_money" },
    ],
    crossBorder: ["papss", "eaps", "siress"],
  },
  languages: ["sw", "en"],
  phone: { countryCode: "+255", example: "+255 754 123 456" },
  dataProtection: {
    law: "Personal Data Protection Act, 2022",
    authority: "Personal Data Protection Commission (PDPC)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; also a SADC member. TIPS links banks and wallets.",
    fr: "Pack conceptuel illustratif ; également membre de la SADC. TIPS relie banques et portefeuilles.",
  },
};

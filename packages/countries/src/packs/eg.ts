import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const eg: CountryPack = {
  code: "EG",
  name: { en: "Egypt", fr: "Égypte" },
  region: "north",
  bloc: "COMESA",
  centralBank: { name: "Central Bank of Egypt", abbreviation: "CBE", url: "https://www.cbe.org.eg" },
  currency: {
    code: "EGP",
    minorUnits: 2,
    symbol: "E£",
    name: { en: "Egyptian pound", fr: "livre égyptienne" },
  },
  // Illustrative: cap ~EGP 2,000 (~USD 40), per-transaction ~EGP 600 (~USD 12).
  offlineLimits: {
    perTransaction: 60_000,
    allowanceCap: 200_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["National ID"] },
  rails: {
    domestic: [
      { id: "instapay", name: "InstaPay (IPN)", type: "instant" },
      { id: "cbe-rtgs", name: "CBE RTGS", type: "rtgs" },
      { id: "egypt-ach", name: "Egyptian ACH", type: "ach" },
      { id: "meeza", name: "Meeza", type: "card" },
      { id: "vodafone-cash", name: "Vodafone Cash", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["ar", "en", "fr"],
  phone: { countryCode: "+20", example: "+20 10 1234 5678" },
  dataProtection: {
    law: "Personal Data Protection Law No. 151 of 2020",
    authority: "Personal Data Protection Center (PDPC)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; Arabic-first market, cross-border transfers need licensing.",
    fr: "Pack conceptuel illustratif ; marché arabophone, transferts transfrontaliers soumis à licence.",
  },
};

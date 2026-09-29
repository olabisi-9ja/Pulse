import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const cm: CountryPack = {
  code: "CM",
  name: { en: "Cameroon", fr: "Cameroun" },
  region: "central",
  bloc: "CEMAC",
  centralBank: {
    name: "Bank of Central African States",
    abbreviation: "BEAC",
    url: "https://www.beac.int",
  },
  currency: {
    code: "XAF",
    minorUnits: 0,
    symbol: "FCFA",
    name: { en: "Central African CFA franc", fr: "franc CFA (BEAC)" },
  },
  // Illustrative: cap XAF 25,000 (~USD 43), per-transaction XAF 7,500 (~USD 13).
  offlineLimits: {
    perTransaction: 7_500,
    allowanceCap: 25_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["CNI (carte nationale d'identité)"] },
  rails: {
    domestic: [
      { id: "sygma", name: "SYGMA", type: "rtgs" },
      { id: "systac", name: "SYSTAC", type: "ach" },
      { id: "gimac", name: "GIMAC", type: "card" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "orange-money", name: "Orange Money", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["fr", "en"],
  phone: { countryCode: "+237", example: "+237 6 71 23 45 67" },
  dataProtection: {
    law: "Law No. 2010/012 on Cybersecurity and Cybercriminality (personal data provisions)",
    authority: "National Agency for Information and Communication Technologies (ANTIC)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; bilingual market. Data-protection framework should be re-verified.",
    fr: "Pack conceptuel illustratif ; marché bilingue. Cadre de protection des données à revérifier.",
  },
};

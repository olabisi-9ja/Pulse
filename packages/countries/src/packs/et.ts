import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const et: CountryPack = {
  code: "ET",
  name: { en: "Ethiopia", fr: "Éthiopie" },
  region: "east",
  bloc: "COMESA",
  centralBank: { name: "National Bank of Ethiopia", abbreviation: "NBE", url: "https://nbe.gov.et" },
  currency: {
    code: "ETB",
    minorUnits: 2,
    symbol: "Br",
    name: { en: "Ethiopian birr", fr: "birr éthiopien" },
  },
  // Illustrative: cap ~ETB 5,000 (~USD 35), per-transaction ~ETB 1,500 (~USD 10).
  offlineLimits: {
    perTransaction: 150_000,
    allowanceCap: 500_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["Fayda (National ID)"] },
  rails: {
    domestic: [
      { id: "eats", name: "EATS", type: "rtgs" },
      { id: "ethswitch", name: "EthSwitch", type: "card" },
      { id: "telebirr", name: "telebirr", type: "mobile_money" },
      { id: "mpesa", name: "M-Pesa", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["am", "om", "ti", "so", "en"],
  phone: { countryCode: "+251", example: "+251 91 123 4567" },
  dataProtection: {
    law: "Personal Data Protection Proclamation No. 1321/2024",
    authority: "Ethiopian Communications Authority",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; data-protection regime is new and should be re-verified.",
    fr: "Pack conceptuel illustratif ; régime de protection des données récent, à revérifier.",
  },
};

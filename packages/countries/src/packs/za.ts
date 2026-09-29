import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const za: CountryPack = {
  code: "ZA",
  name: { en: "South Africa", fr: "Afrique du Sud" },
  region: "southern",
  bloc: "SADC",
  centralBank: {
    name: "South African Reserve Bank",
    abbreviation: "SARB",
    url: "https://www.resbank.co.za",
  },
  currency: {
    code: "ZAR",
    minorUnits: 2,
    symbol: "R",
    name: { en: "South African rand", fr: "rand sud-africain" },
  },
  // Illustrative: cap ~ZAR 700 (~USD 39), per-transaction ~ZAR 200 (~USD 11).
  offlineLimits: {
    perTransaction: 20_000,
    allowanceCap: 70_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["South African ID (smart card or green book)", "Passport"] },
  rails: {
    domestic: [
      { id: "payshap", name: "PayShap", type: "instant" },
      { id: "samos", name: "SAMOS", type: "rtgs" },
      { id: "eft", name: "BankservAfrica EFT", type: "ach" },
    ],
    crossBorder: ["papss", "siress"],
  },
  languages: ["en", "zu", "xh", "af"],
  phone: { countryCode: "+27", example: "+27 82 123 4567" },
  dataProtection: {
    law: "Protection of Personal Information Act, 2013 (POPIA)",
    authority: "Information Regulator",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; SIRESS covers SADC cross-border settlement.",
    fr: "Pack conceptuel illustratif ; SIRESS couvre le règlement transfrontalier de la SADC.",
  },
};

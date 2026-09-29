import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const tg: CountryPack = {
  code: "TG",
  name: { en: "Togo", fr: "Togo" },
  region: "west",
  bloc: "WAEMU",
  centralBank: {
    name: "Central Bank of West African States",
    abbreviation: "BCEAO",
    url: "https://www.bceao.int",
  },
  currency: {
    code: "XOF",
    minorUnits: 0,
    symbol: "F CFA",
    name: { en: "West African CFA franc", fr: "franc CFA (BCEAO)" },
  },
  // Illustrative: cap XOF 25,000 (~USD 43), per-transaction XOF 7,500 (~USD 13).
  offlineLimits: {
    perTransaction: 7_500,
    allowanceCap: 25_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["CNI (carte nationale d'identité)", "e-ID Togo"] },
  rails: {
    domestic: [
      { id: "pi-spi", name: "PI-SPI", type: "instant" },
      { id: "star-uemoa", name: "STAR-UEMOA", type: "rtgs" },
      { id: "sica-uemoa", name: "SICA-UEMOA", type: "ach" },
      { id: "gim-uemoa", name: "GIM-UEMOA", type: "card" },
      { id: "t-money", name: "T-Money", type: "mobile_money" },
      { id: "flooz", name: "Flooz", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["fr", "ee"],
  phone: { countryCode: "+228", example: "+228 90 12 34 56" },
  dataProtection: {
    law: "Loi n° 2019-014 du 29 octobre 2019 relative à la protection des données à caractère personnel",
    authority: "Instance de Protection des Données à Caractère Personnel (IPDCP)",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; BCEAO rules apply across WAEMU.",
    fr: "Pack conceptuel illustratif ; les règles de la BCEAO s'appliquent dans l'UEMOA.",
  },
};

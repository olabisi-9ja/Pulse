import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const bj: CountryPack = {
  code: "BJ",
  name: { en: "Benin", fr: "Bénin" },
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
  kyc: { tiers: standardKycTiers, idSystems: ["NPI (ANIP)"] },
  rails: {
    domestic: [
      { id: "pi-spi", name: "PI-SPI", type: "instant" },
      { id: "star-uemoa", name: "STAR-UEMOA", type: "rtgs" },
      { id: "sica-uemoa", name: "SICA-UEMOA", type: "ach" },
      { id: "gim-uemoa", name: "GIM-UEMOA", type: "card" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "moov-money", name: "Moov Money", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["fr"],
  phone: { countryCode: "+229", example: "+229 01 97 12 34 56" },
  dataProtection: {
    law: "Loi n° 2017-20 du 20 avril 2018 portant code du numérique en République du Bénin",
    authority: "Autorité de Protection des Données à caractère Personnel (APDP)",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; BCEAO rules apply across WAEMU.",
    fr: "Pack conceptuel illustratif ; les règles de la BCEAO s'appliquent dans l'UEMOA.",
  },
};

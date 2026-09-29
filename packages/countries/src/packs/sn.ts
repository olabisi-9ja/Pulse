import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const sn: CountryPack = {
  code: "SN",
  name: { en: "Senegal", fr: "Sénégal" },
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
  kyc: { tiers: standardKycTiers, idSystems: ["CNI (carte nationale d'identité)"] },
  rails: {
    domestic: [
      { id: "pi-spi", name: "PI-SPI", type: "instant" },
      { id: "star-uemoa", name: "STAR-UEMOA", type: "rtgs" },
      { id: "sica-uemoa", name: "SICA-UEMOA", type: "ach" },
      { id: "gim-uemoa", name: "GIM-UEMOA", type: "card" },
      { id: "orange-money", name: "Orange Money", type: "mobile_money" },
      { id: "wave", name: "Wave", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["fr", "wo"],
  phone: { countryCode: "+221", example: "+221 77 123 45 67" },
  dataProtection: {
    law: "Loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel",
    authority: "Commission de Protection des Données Personnelles (CDP)",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; BCEAO rules apply across WAEMU.",
    fr: "Pack conceptuel illustratif ; les règles de la BCEAO s'appliquent dans l'UEMOA.",
  },
};

import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const ci: CountryPack = {
  code: "CI",
  name: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire" },
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
  kyc: { tiers: standardKycTiers, idSystems: ["CNI (ONECI)"] },
  rails: {
    domestic: [
      { id: "pi-spi", name: "PI-SPI", type: "instant" },
      { id: "star-uemoa", name: "STAR-UEMOA", type: "rtgs" },
      { id: "sica-uemoa", name: "SICA-UEMOA", type: "ach" },
      { id: "gim-uemoa", name: "GIM-UEMOA", type: "card" },
      { id: "orange-money", name: "Orange Money", type: "mobile_money" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "moov-money", name: "Moov Money", type: "mobile_money" },
      { id: "wave", name: "Wave", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["fr"],
  phone: { countryCode: "+225", example: "+225 07 12 34 56 78" },
  dataProtection: {
    law: "Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel",
    authority: "Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire (ARTCI)",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; large multi-operator mobile money market.",
    fr: "Pack conceptuel illustratif ; marché mobile money multi-opérateurs de grande taille.",
  },
};

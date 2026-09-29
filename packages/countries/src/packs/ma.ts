import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const ma: CountryPack = {
  code: "MA",
  name: { en: "Morocco", fr: "Maroc" },
  region: "north",
  bloc: null,
  centralBank: { name: "Bank Al-Maghrib", abbreviation: "BAM", url: "https://www.bkam.ma" },
  currency: {
    code: "MAD",
    minorUnits: 2,
    symbol: "DH",
    name: { en: "Moroccan dirham", fr: "dirham marocain" },
  },
  // Illustrative: cap ~MAD 400 (~USD 43), per-transaction ~MAD 120 (~USD 13).
  offlineLimits: {
    perTransaction: 12_000,
    allowanceCap: 40_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["CNIE (carte nationale d'identité électronique)"] },
  rails: {
    domestic: [
      { id: "srbm", name: "SRBM", type: "rtgs" },
      { id: "simt", name: "SIMT", type: "ach" },
      { id: "cmi", name: "CMI", type: "card" },
      { id: "inwi-money", name: "inwi money", type: "mobile_money" },
      { id: "orange-money", name: "Orange Money", type: "mobile_money" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["ar", "fr", "zgh"],
  phone: { countryCode: "+212", example: "+212 6 12 34 56 78" },
  dataProtection: {
    law: "Law No. 09-08 on the protection of individuals with regard to the processing of personal data",
    authority: "Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; bilingual Arabic/French market outside the listed regional blocs.",
    fr: "Pack conceptuel illustratif ; marché arabe/français hors des blocs régionaux listés.",
  },
};

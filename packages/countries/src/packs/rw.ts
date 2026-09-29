import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const rw: CountryPack = {
  code: "RW",
  name: { en: "Rwanda", fr: "Rwanda" },
  region: "east",
  bloc: "EAC",
  centralBank: { name: "National Bank of Rwanda", abbreviation: "BNR", url: "https://www.bnr.rw" },
  currency: {
    code: "RWF",
    minorUnits: 0,
    symbol: "FRw",
    name: { en: "Rwandan franc", fr: "franc rwandais" },
  },
  // Illustrative: cap RWF 50,000 (~USD 34), per-transaction RWF 15,000 (~USD 10).
  offlineLimits: {
    perTransaction: 15_000,
    allowanceCap: 50_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["National ID"] },
  rails: {
    domestic: [
      { id: "rswitch", name: "RSwitch", type: "instant" },
      { id: "ripps", name: "RIPPS", type: "rtgs" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "airtel-money", name: "Airtel Money", type: "mobile_money" },
    ],
    crossBorder: ["papss", "eaps"],
  },
  languages: ["rw", "en", "fr", "sw"],
  phone: { countryCode: "+250", example: "+250 788 123 456" },
  dataProtection: {
    law: "Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy",
    authority: "National Cyber Security Authority (NCSA)",
    residency: "required",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; local storage of personal data is the default requirement.",
    fr: "Pack conceptuel illustratif ; le stockage local des données personnelles est la règle par défaut.",
  },
};

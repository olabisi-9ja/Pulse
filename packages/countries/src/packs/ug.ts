import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const ug: CountryPack = {
  code: "UG",
  name: { en: "Uganda", fr: "Ouganda" },
  region: "east",
  bloc: "EAC",
  centralBank: { name: "Bank of Uganda", abbreviation: "BoU", url: "https://www.bou.or.ug" },
  currency: {
    code: "UGX",
    minorUnits: 0,
    symbol: "USh",
    name: { en: "Ugandan shilling", fr: "shilling ougandais" },
  },
  // Illustrative: cap UGX 150,000 (~USD 40), per-transaction UGX 40,000 (~USD 11).
  offlineLimits: {
    perTransaction: 40_000,
    allowanceCap: 150_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["National ID (NIRA)"] },
  rails: {
    domestic: [
      { id: "uniss", name: "UNISS", type: "rtgs" },
      { id: "eft", name: "Uganda EFT", type: "ach" },
      { id: "mtn-momo", name: "MTN MoMo", type: "mobile_money" },
      { id: "airtel-money", name: "Airtel Money", type: "mobile_money" },
    ],
    crossBorder: ["papss", "eaps"],
  },
  languages: ["en", "sw", "lg"],
  phone: { countryCode: "+256", example: "+256 772 123 456" },
  dataProtection: {
    law: "Data Protection and Privacy Act, 2019",
    authority: "Personal Data Protection Office (PDPO)",
    residency: "none",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; also a COMESA member. Mobile money is the main rail.",
    fr: "Pack conceptuel illustratif ; également membre du COMESA. Le mobile money est le rail principal.",
  },
};

import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const ke: CountryPack = {
  code: "KE",
  name: { en: "Kenya", fr: "Kenya" },
  region: "east",
  bloc: "EAC",
  centralBank: { name: "Central Bank of Kenya", abbreviation: "CBK", url: "https://www.centralbank.go.ke" },
  currency: {
    code: "KES",
    minorUnits: 2,
    symbol: "KSh",
    name: { en: "Kenyan shilling", fr: "shilling kényan" },
  },
  // Illustrative: cap ~KES 5,000 (~USD 39), per-transaction ~KES 1,500 (~USD 12).
  offlineLimits: {
    perTransaction: 150_000,
    allowanceCap: 500_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["National ID", "Alien ID", "Passport"] },
  rails: {
    domestic: [
      { id: "pesalink", name: "PesaLink", type: "instant" },
      { id: "kepss", name: "KEPSS", type: "rtgs" },
      { id: "eft", name: "Kenya EFT", type: "ach" },
      { id: "mpesa", name: "M-Pesa", type: "mobile_money" },
      { id: "airtel-money", name: "Airtel Money", type: "mobile_money" },
    ],
    crossBorder: ["papss", "eaps"],
  },
  languages: ["en", "sw"],
  phone: { countryCode: "+254", example: "+254 712 345 678" },
  dataProtection: {
    law: "Data Protection Act, 2019",
    authority: "Office of the Data Protection Commissioner (ODPC)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; also a COMESA member. M-Pesa dominates wallet usage.",
    fr: "Pack conceptuel illustratif ; également membre du COMESA. M-Pesa domine les portefeuilles.",
  },
};

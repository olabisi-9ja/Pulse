import type { CountryPack } from "../schema";
import { standardKycTiers } from "./_kyc";

export const ng: CountryPack = {
  code: "NG",
  name: { en: "Nigeria", fr: "Nigéria" },
  region: "west",
  bloc: "ECOWAS",
  centralBank: { name: "Central Bank of Nigeria", abbreviation: "CBN", url: "https://www.cbn.gov.ng" },
  currency: {
    code: "NGN",
    minorUnits: 2,
    symbol: "₦",
    name: { en: "Nigerian naira", fr: "naira nigérian" },
  },
  // Illustrative: cap ~NGN 50,000 (~USD 33), per-transaction ~NGN 15,000 (~USD 10).
  offlineLimits: {
    perTransaction: 1_500_000,
    allowanceCap: 5_000_000,
    allowanceTtlHours: 72,
    maxPaymentsPerAllowance: 200,
    releaseGraceHours: 24,
  },
  kyc: { tiers: standardKycTiers, idSystems: ["NIN", "BVN"] },
  rails: {
    domestic: [
      { id: "nip", name: "NIBSS Instant Payment (NIP)", type: "instant" },
      { id: "rtgs", name: "CBN RTGS", type: "rtgs" },
      { id: "verve", name: "Verve", type: "card" },
    ],
    crossBorder: ["papss"],
  },
  languages: ["en", "ha", "yo", "ig"],
  phone: { countryCode: "+234", example: "+234 803 123 4567" },
  dataProtection: {
    law: "Nigeria Data Protection Act 2023",
    authority: "Nigeria Data Protection Commission (NDPC)",
    residency: "preferred",
  },
  status: "concept",
  notes: {
    en: "Illustrative concept pack; limits are placeholders pending regulator engagement.",
    fr: "Pack conceptuel illustratif ; limites indicatives en attente d'échanges avec le régulateur.",
  },
};

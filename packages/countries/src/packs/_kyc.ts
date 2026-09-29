import type { CountryPack } from "../schema";

/** Default three-tier KYC ladder; packs may override the multipliers. */
export const standardKycTiers: CountryPack["kyc"]["tiers"] = [
  {
    id: "tier0",
    label: { en: "Basic (phone number only)", fr: "Basique (numéro de téléphone seul)" },
    allowanceCapMultiplier: 0.2,
  },
  {
    id: "tier1",
    label: { en: "Standard (national ID verified)", fr: "Standard (pièce d'identité vérifiée)" },
    allowanceCapMultiplier: 0.6,
  },
  {
    id: "tier2",
    label: { en: "Full (ID and address verified)", fr: "Complet (identité et adresse vérifiées)" },
    allowanceCapMultiplier: 1,
  },
];

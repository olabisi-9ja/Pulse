import type { Locale } from "@/lib/i18n";
import en, { type LegalMessages } from "./en";
import fr from "./fr";

export type { LegalDoc, LegalMessages, LegalSection } from "./en";

const catalog: Record<Locale, LegalMessages> = { en, fr };

export function getLegalMessages(locale: Locale): LegalMessages {
  return catalog[locale];
}

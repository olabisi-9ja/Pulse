import type { Locale } from "@/lib/i18n";
import en, { type SiteMessages } from "./en";
import fr from "./fr";

export type { SiteMessages };

const catalog: Record<Locale, SiteMessages> = { en, fr };

export function getSiteMessages(locale: Locale): SiteMessages {
  return catalog[locale];
}

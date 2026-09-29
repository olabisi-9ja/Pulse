import type { Locale } from "@/lib/i18n";
import en, { type DocsMessages } from "./en";
import fr from "./fr";

export type { DocsMessages };
export { NAV_GROUPS, PAGE_KEYS, PAGE_SLUGS } from "./en";
export type { Block, Callout, PageKey, Table } from "./en";

const catalog: Record<Locale, DocsMessages> = { en, fr };

export function getDocsMessages(locale: Locale): DocsMessages {
  return catalog[locale];
}

import type { Locale } from "@/lib/i18n";
import en, { type ConsoleMessages } from "./en";
import fr from "./fr";

export type { ConsoleMessages };

const catalog: Record<Locale, ConsoleMessages> = { en, fr };

export function getConsoleMessages(locale: Locale): ConsoleMessages {
  return catalog[locale];
}

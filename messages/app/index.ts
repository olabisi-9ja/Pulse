import type { Locale } from "@/lib/i18n";
import en, { type AppMessages } from "./en";
import fr from "./fr";

export type { AppMessages };
export const appMessages: Record<Locale, AppMessages> = { en, fr };

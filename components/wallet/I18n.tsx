"use client";
import { createContext, useContext } from "react";
import { fmt, type Locale } from "@/lib/i18n";
import { type AppMessages, appMessages } from "@/messages/app";

const Ctx = createContext<{ locale: Locale; m: AppMessages }>({ locale: "en", m: appMessages.en });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, m: appMessages[locale] }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const { locale, m } = useContext(Ctx);
  return { locale, m, t: fmt };
}

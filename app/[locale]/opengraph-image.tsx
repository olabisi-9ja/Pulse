import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { isLocale, locales } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export const alt = "PayVault";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** Social share card for every page under a locale: headline, logo, brand colours. */
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const h = getSiteMessages(locale).home.hero;
  const logo = await readFile(join(process.cwd(), "public/brand/payvault-mark-dark.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#14365a", color: "#ffffff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={64} height={67} alt="" />
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2 }}>PAYVAULT</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 112, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>{h.line1}</span>
          <span style={{ fontSize: 112, fontWeight: 900, lineHeight: 1, textTransform: "uppercase", color: "#2fb386" }}>{h.line2}</span>
        </div>
        <span style={{ fontSize: 30, opacity: 0.75 }}>{h.eyebrow}</span>
      </div>
    ),
    size,
  );
}

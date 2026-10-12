/**
 * A trader's stall sticker: a printed QR or NFC tag holding a link to pay her.
 * The customer's phone scans or taps it, enters amount and PIN, and signs the
 * payment offline; the trader is told by SMS/USSD once the payment syncs.
 */
export type Sticker = { merchantId: string; name: string };

export function stickerUrl(origin: string, locale: string, s: Sticker): string {
  return `${origin}/${locale}/app?pay=${s.merchantId}&n=${encodeURIComponent(s.name)}`;
}

/** Reads a sticker link (from a QR scan or the page URL); null if it isn't one. */
export function parseSticker(text: string): Sticker | null {
  try {
    const u = new URL(text.trim());
    const id = u.searchParams.get("pay") ?? "";
    return /^[0-9a-f]{16}$/.test(id) ? { merchantId: id, name: (u.searchParams.get("n") ?? "").slice(0, 32) } : null;
  } catch {
    return null;
  }
}

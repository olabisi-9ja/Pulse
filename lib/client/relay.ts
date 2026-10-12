/**
 * Phone-to-phone delivery: a phone with payments waiting to sync shows them as a
 * QR; any nearby PayVault phone scans it and carries them to the server (and can
 * pass them on again). Payments are signed, so a carrier can't alter or redirect
 * them, and the server ignores copies it already has.
 */
import { bundlesToRelay, decodeBundle, fromBase64Url, paymentId, relayToBundles, toBase64Url, toHex } from "@payvault/protocol";
import { getOutbox, type OutboxItem, putOutbox } from "./offline";

/** Payments per code: denser codes stop scanning on cheap cameras. SMS uses 1 (about 3 texts each). */
export const PER_CODE = 4;

export function relayCodes(items: OutboxItem[], perCode = PER_CODE): string[] {
  const codes: string[] = [];
  for (let i = 0; i < items.length; i += perCode) {
    codes.push(bundlesToRelay(items.slice(i, i + perCode).map((it) => fromBase64Url(it.bundle))));
  }
  return codes;
}

export const parseRelay = relayToBundles;

/** Queues another phone's payments in this phone's outbox; they go up on the next sync. Returns how many are new. */
export async function carry(u: string, bundles: Uint8Array[]): Promise<number> {
  const before = (await getOutbox(u)).length;
  for (const raw of bundles) {
    const { cert, payment } = decodeBundle(raw); // throws on garbage, before anything is stored
    const item: OutboxItem = {
      id: toHex(await paymentId(payment)),
      role: "courier",
      bundle: toBase64Url(raw),
      allowanceId: toHex(cert.allowanceId),
      seq: payment.seq,
      nonce: toHex(payment.nonce),
      amount: payment.amount,
      currency: cert.currency,
      fromCredit: 0,
      counterparty: "",
      createdAt: Date.now(),
      status: "pending",
    };
    await putOutbox(u, item);
  }
  return (await getOutbox(u)).length - before;
}

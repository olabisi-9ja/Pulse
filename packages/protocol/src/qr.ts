/** QR text framing: "PV" + base45(payload). All characters are QR alphanumeric. */
import { base45Decode, base45Encode } from "./base45";
import { ProtocolError } from "./bytes";
import { decodeBundle, decodeRequest, encodeBundle, encodeRequest, peekType } from "./codec";
import { type Bundle, MsgType, type PaymentRequest } from "./types";

const PREFIX = "PV";

export function toQrText(payload: Uint8Array): string {
  return PREFIX + base45Encode(payload);
}

export function fromQrText(text: string): Uint8Array {
  const t = text.trim();
  if (!t.startsWith(PREFIX)) throw new ProtocolError("not_payvault", "Not a PayVault code");
  return base45Decode(t.slice(PREFIX.length));
}

export type Scanned = { kind: "request"; request: PaymentRequest } | { kind: "bundle"; bundle: Bundle };

export function parseQr(text: string): Scanned {
  const bytes = fromQrText(text);
  const type = peekType(bytes);
  if (type === MsgType.Request) return { kind: "request", request: decodeRequest(bytes) };
  if (type === MsgType.Bundle) return { kind: "bundle", bundle: decodeBundle(bytes) };
  throw new ProtocolError("bad_type", "Unsupported PayVault code");
}

export const requestToQr = (q: PaymentRequest) => toQrText(encodeRequest(q));
export const bundleToQr = (b: Bundle) => toQrText(encodeBundle(b));

/**
 * Relay code: several signed bundles for another phone (or an SMS) to carry to
 * the server. "PVR" + base45([count][u16 len, bundle]...). Carriers can't alter
 * them: each bundle is signed by its payer.
 */
const RELAY_PREFIX = "PVR";

export function bundlesToRelay(bundles: Uint8Array[]): string {
  if (bundles.length < 1 || bundles.length > 255) throw new ProtocolError("bad_relay", "1 to 255 bundles per relay code");
  const out = new Uint8Array(1 + bundles.reduce((n, b) => n + 2 + b.length, 0));
  out[0] = bundles.length;
  let o = 1;
  for (const b of bundles) {
    out[o] = b.length >> 8;
    out[o + 1] = b.length & 0xff;
    out.set(b, o + 2);
    o += 2 + b.length;
  }
  return RELAY_PREFIX + base45Encode(out);
}

/** Bundles from a relay code, or null if the text isn't a well-formed one. */
export function relayToBundles(text: string): Uint8Array[] | null {
  const t = text.trim();
  if (!t.startsWith(RELAY_PREFIX)) return null;
  try {
    const b = base45Decode(t.slice(RELAY_PREFIX.length));
    const out: Uint8Array[] = [];
    let o = 1;
    for (let i = 0; i < b[0]; i++) {
      if (o + 2 > b.length) return null;
      const len = (b[o] << 8) | b[o + 1];
      out.push(b.slice(o + 2, o + 2 + len));
      o += 2 + len;
    }
    return out.length && o === b.length ? out : null;
  } catch {
    return null;
  }
}

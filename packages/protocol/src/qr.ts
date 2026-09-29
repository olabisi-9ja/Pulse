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

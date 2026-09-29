/**
 * Base45 (RFC 9285). Output uses only the QR alphanumeric charset, which gives
 * denser QR codes than byte mode and survives camera decoders that mangle binary.
 */
import { ProtocolError } from "./bytes";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const LOOKUP = new Map([...ALPHABET].map((c, i) => [c, i]));

export function base45Encode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) {
      let n = bytes[i] * 256 + bytes[i + 1];
      const c = n % 45;
      n = (n - c) / 45;
      const d = n % 45;
      const e = (n - d) / 45;
      out += ALPHABET[c] + ALPHABET[d] + ALPHABET[e];
    } else {
      const n = bytes[i];
      out += ALPHABET[n % 45] + ALPHABET[Math.floor(n / 45)];
    }
  }
  return out;
}

export function base45Decode(s: string): Uint8Array {
  const vals: number[] = [];
  for (const ch of s) {
    const v = LOOKUP.get(ch);
    if (v === undefined) throw new ProtocolError("bad_base45", "Invalid base45 character");
    vals.push(v);
  }
  if (vals.length % 3 === 1) throw new ProtocolError("bad_base45", "Invalid base45 length");
  const out: number[] = [];
  for (let i = 0; i < vals.length; i += 3) {
    if (i + 2 < vals.length) {
      const n = vals[i] + vals[i + 1] * 45 + vals[i + 2] * 2025;
      if (n > 0xffff) throw new ProtocolError("bad_base45", "Invalid base45 triplet");
      out.push(n >> 8, n & 0xff);
    } else {
      const n = vals[i] + vals[i + 1] * 45;
      if (n > 0xff) throw new ProtocolError("bad_base45", "Invalid base45 pair");
      out.push(n);
    }
  }
  return Uint8Array.from(out);
}

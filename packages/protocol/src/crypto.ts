/**
 * ECDSA P-256 over WebCrypto. P-256 is the curve that phone secure hardware
 * (iOS Secure Enclave, Android StrongBox) supports natively, and WebCrypto can
 * keep private keys non-extractable in the browser.
 *
 * Signatures are raw r||s (64 bytes). Public keys travel compressed (33 bytes).
 */
import { concat, ProtocolError } from "./bytes";

const ALG = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN_ALG = { name: "ECDSA", hash: "SHA-256" } as const;

const P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
const B = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;

export type KeyPair = { publicKey: CryptoKey; privateKey: CryptoKey };

function subtle(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) {
    throw new ProtocolError("no_webcrypto", "WebCrypto is unavailable (requires HTTPS or localhost)");
  }
  return globalThis.crypto.subtle;
}

/** Generates a signing key pair. Private key is non-extractable unless asked. */
export async function generateKeyPair(extractable = false): Promise<KeyPair> {
  const kp = (await subtle().generateKey(ALG, extractable, ["sign", "verify"])) as CryptoKeyPair;
  return kp;
}

export async function exportPublicKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = new Uint8Array(await subtle().exportKey("raw", key));
  return compressPoint(raw);
}

export async function importPublicKey(compressed: Uint8Array): Promise<CryptoKey> {
  const raw = decompressPoint(compressed);
  return subtle().importKey("raw", raw as BufferSource, ALG, true, ["verify"]);
}

export async function exportPrivateKeyPkcs8(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await subtle().exportKey("pkcs8", key));
}

export async function importPrivateKeyPkcs8(pkcs8: Uint8Array, extractable = false): Promise<CryptoKey> {
  return subtle().importKey("pkcs8", pkcs8 as BufferSource, ALG, extractable, ["sign"]);
}

export async function sign(privateKey: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await subtle().sign(SIGN_ALG, privateKey, data as BufferSource));
}

export async function verify(publicKey: CryptoKey, sig: Uint8Array, data: Uint8Array): Promise<boolean> {
  if (sig.length !== 64) return false;
  try {
    return await subtle().verify(SIGN_ALG, publicKey, sig as BufferSource, data as BufferSource);
  } catch {
    return false;
  }
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await subtle().digest("SHA-256", data as BufferSource));
}

/** 16-byte truncated SHA-256, used for payment ids and chain links. */
export async function hash16(data: Uint8Array): Promise<Uint8Array> {
  return (await sha256(data)).slice(0, 16);
}

export function compressPoint(raw: Uint8Array): Uint8Array {
  if (raw.length !== 65 || raw[0] !== 0x04) throw new ProtocolError("bad_key", "Expected uncompressed P-256 point");
  const prefix = (raw[64] & 1) === 1 ? 0x03 : 0x02;
  return concat(Uint8Array.of(prefix), raw.slice(1, 33));
}

export function decompressPoint(c: Uint8Array): Uint8Array {
  if (c.length !== 33 || (c[0] !== 0x02 && c[0] !== 0x03)) {
    throw new ProtocolError("bad_key", "Expected compressed P-256 point");
  }
  const x = bytesToBig(c.slice(1));
  if (x >= P) throw new ProtocolError("bad_key", "Point not on curve");
  const rhs = mod(x * x * x - 3n * x + B);
  let y = modPow(rhs, (P + 1n) / 4n);
  if (mod(y * y) !== rhs) throw new ProtocolError("bad_key", "Point not on curve");
  if ((y & 1n) !== BigInt(c[0] & 1)) y = P - y;
  return concat(Uint8Array.of(0x04), c.slice(1), bigToBytes(y, 32));
}

function mod(a: bigint): bigint {
  const r = a % P;
  return r >= 0n ? r : r + P;
}

function modPow(base: bigint, exp: bigint): bigint {
  let result = 1n;
  base = mod(base);
  while (exp > 0n) {
    if (exp & 1n) result = mod(result * base);
    base = mod(base * base);
    exp >>= 1n;
  }
  return result;
}

function bytesToBig(b: Uint8Array): bigint {
  let n = 0n;
  for (const x of b) n = (n << 8n) | BigInt(x);
  return n;
}

function bigToBytes(n: bigint, len: number): Uint8Array {
  const out = new Uint8Array(len);
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

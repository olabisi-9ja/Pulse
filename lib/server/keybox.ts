import "server-only";
/**
 * Encrypts partner issuer private keys at rest with AES-256-GCM under
 * PV_MASTER_KEY. In production this should move to a KMS/HSM; the interface
 * (seal/open) stays the same.
 */
import { concat, fromBase64Url, randomBytes } from "@payvault/protocol";

let cached: Promise<CryptoKey> | undefined;

function masterKey(): Promise<CryptoKey> {
  cached ??= (async () => {
    const raw = process.env.PV_MASTER_KEY;
    let keyBytes: Uint8Array;
    if (raw) {
      keyBytes = fromBase64Url(raw.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"));
      if (keyBytes.length !== 32) throw new Error("PV_MASTER_KEY must be 32 bytes (base64)");
    } else if (process.env.NODE_ENV !== "production") {
      // Development-only fixed key so local data survives restarts.
      keyBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("payvault-dev-key")));
    } else {
      throw new Error("PV_MASTER_KEY is required in production");
    }
    return crypto.subtle.importKey("raw", keyBytes as BufferSource, "AES-GCM", false, ["encrypt", "decrypt"]);
  })();
  return cached;
}

export async function seal(plain: Uint8Array): Promise<Uint8Array> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, await masterKey(), plain as BufferSource);
  return concat(iv, new Uint8Array(ct));
}

export async function open(sealed: Uint8Array): Promise<Uint8Array> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: sealed.slice(0, 12) as BufferSource },
    await masterKey(),
    sealed.slice(12) as BufferSource,
  );
  return new Uint8Array(pt);
}

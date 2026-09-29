import "server-only";
/** Partner issuer keys: create, rotate, load for signing, publish for verification. */
import {
  exportPrivateKeyPkcs8,
  exportPublicKey,
  generateKeyPair,
  importPrivateKeyPkcs8,
  toHex,
} from "@payvault/protocol";
import { bytes, type Db } from "./db";
import { open, seal } from "./keybox";

export type ActiveIssuer = { kid: number; privateKey: CryptoKey; publicKey: Uint8Array };

const signerCache = new Map<number, Promise<CryptoKey>>();

async function createKey(tx: Db, partnerId: string): Promise<number> {
  const kp = await generateKeyPair(true);
  const pub = await exportPublicKey(kp.publicKey);
  const sealed = await seal(await exportPrivateKeyPkcs8(kp.privateKey));
  const [row] = await tx<{ kid: number }[]>`
    insert into pv.issuer_keys (partner_id, public_key, private_key_enc)
    values (${partnerId}, ${pub}, ${sealed})
    returning kid`;
  return row.kid;
}

export async function activeIssuer(tx: Db, partnerId: string): Promise<ActiveIssuer> {
  let [row] = await tx<{ kid: number; public_key: Buffer; private_key_enc: Buffer }[]>`
    select kid, public_key, private_key_enc from pv.issuer_keys
    where partner_id = ${partnerId} and status = 'active'`;
  if (!row) {
    await createKey(tx, partnerId);
    [row] = await tx<{ kid: number; public_key: Buffer; private_key_enc: Buffer }[]>`
      select kid, public_key, private_key_enc from pv.issuer_keys
      where partner_id = ${partnerId} and status = 'active'`;
  }
  let signer = signerCache.get(row.kid);
  if (!signer) {
    signer = open(bytes(row.private_key_enc)).then((pk) => importPrivateKeyPkcs8(pk));
    signerCache.set(row.kid, signer);
  }
  return { kid: row.kid, privateKey: await signer, publicKey: bytes(row.public_key) };
}

/** Retires the active key and creates a new one. Old certs stay verifiable until they expire. */
export async function rotateIssuerKey(tx: Db, partnerId: string): Promise<number> {
  await tx`update pv.issuer_keys set status = 'retired', retired_at = now()
           where partner_id = ${partnerId} and status = 'active'`;
  return createKey(tx, partnerId);
}

export type PublicIssuerKey = { kid: number; partnerId: string; publicKey: string; status: string };

/** Keys devices must trust to verify allowances offline (active + retired, not revoked). */
export async function publicIssuerKeys(tx: Db): Promise<PublicIssuerKey[]> {
  const rows = await tx<{ kid: number; partner_id: string; public_key: Buffer; status: string }[]>`
    select kid, partner_id, public_key, status from pv.issuer_keys
    where status in ('active', 'retired') order by kid`;
  return rows.map((r) => ({
    kid: r.kid,
    partnerId: r.partner_id,
    publicKey: toHex(bytes(r.public_key)),
    status: r.status,
  }));
}

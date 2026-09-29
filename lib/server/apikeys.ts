import "server-only";
/** Partner API keys: "pv_<prefix>_<secret>". Only a SHA-256 of the secret is stored. */
import { randomBytes, toBase64Url, toHex } from "@payvault/protocol";
import type { Db } from "./db";
import { type Partner, partnerById } from "./identity";

async function hashSecret(secret: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)));
}

export async function createApiKey(
  tx: Db,
  partnerId: string,
  name: string,
  createdBy: string | null,
): Promise<{ id: string; key: string; prefix: string }> {
  const prefix = toHex(randomBytes(6));
  const secret = toBase64Url(randomBytes(24));
  const [row] = await tx<{ id: string }[]>`
    insert into pv.api_keys (partner_id, name, prefix, secret_hash, created_by)
    values (${partnerId}, ${name.slice(0, 60)}, ${prefix}, ${await hashSecret(secret)}, ${createdBy})
    returning id`;
  return { id: row.id, key: `pv_${prefix}_${secret}`, prefix };
}

export async function revokeApiKey(tx: Db, partnerId: string, id: string): Promise<void> {
  await tx`update pv.api_keys set revoked_at = now() where id = ${id} and partner_id = ${partnerId} and revoked_at is null`;
}

/** Resolves a bearer token to its partner, or null. Constant-time hash compare. */
export async function authenticateApiKey(tx: Db, authorization: string | null): Promise<Partner | null> {
  const m = authorization?.match(/^Bearer\s+pv_([0-9a-f]{12})_([A-Za-z0-9_-]{20,64})$/);
  if (!m) return null;
  const [row] = await tx<{ id: string; partner_id: string; secret_hash: Buffer }[]>`
    select id, partner_id, secret_hash from pv.api_keys where prefix = ${m[1]} and revoked_at is null`;
  if (!row) return null;
  const given = await hashSecret(m[2]);
  const stored = new Uint8Array(row.secret_hash);
  let diff = given.length ^ stored.length;
  for (let i = 0; i < Math.min(given.length, stored.length); i++) diff |= given[i] ^ stored[i];
  if (diff !== 0) return null;
  await tx`update pv.api_keys set last_used_at = now() where id = ${row.id}`;
  const partner = await partnerById(tx, row.partner_id);
  return partner?.status === "active" ? partner : null;
}

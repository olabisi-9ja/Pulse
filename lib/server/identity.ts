import "server-only";
/** Partners, users, merchants and devices. */
import { randomBytes, toHex } from "@payvault/protocol";
import { bytes, type Db } from "./db";
import { packFor } from "./policy";

export const SANDBOX_SLUG = "payvault-sandbox";

export type Partner = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  ledger_mode: "hosted" | "external";
  credit_fee_bps: number;
  credit_term_days: number;
  webhook_url: string | null;
  webhook_secret: string | null;
  status: string;
};

export async function sandboxPartner(tx: Db): Promise<Partner> {
  const [p] = await tx<Partner[]>`
    insert into pv.partners (slug, name, kind, countries)
    values (${SANDBOX_SLUG}, 'PayVault Sandbox', 'sandbox', '{}')
    on conflict (slug) do update set slug = excluded.slug
    returning *`;
  return p;
}

export async function partnerById(tx: Db, id: string): Promise<Partner | undefined> {
  const [p] = await tx<Partner[]>`select * from pv.partners where id = ${id}`;
  return p;
}

export type AppUser = {
  id: string;
  email: string;
  partner_id: string;
  display_name: string;
  country: string;
  currency: string;
  locale: "en" | "fr";
  kyc_tier: "tier0" | "tier1" | "tier2";
  merchant_id: Uint8Array | null;
  merchant_name: string | null;
  status: "active" | "frozen";
  created_at: Date;
};

function normalize(u: AppUser): AppUser {
  return { ...u, merchant_id: u.merchant_id ? bytes(u.merchant_id) : null };
}

export async function userById(tx: Db, id: string): Promise<AppUser | undefined> {
  const [u] = await tx<AppUser[]>`select * from pv.users where id = ${id}`;
  return u && normalize(u);
}

export async function userByMerchantId(tx: Db, merchantId: Uint8Array): Promise<AppUser | undefined> {
  const [u] = await tx<AppUser[]>`select * from pv.users where merchant_id = ${merchantId}`;
  return u && normalize(u);
}

export async function userByEmail(tx: Db, email: string): Promise<AppUser | undefined> {
  const [u] = await tx<AppUser[]>`select * from pv.users where lower(email) = lower(${email})`;
  return u && normalize(u);
}

export async function createUser(
  tx: Db,
  input: { id: string; email: string; displayName: string; country: string; locale: "en" | "fr"; partnerId?: string },
): Promise<AppUser> {
  const pack = packFor(input.country);
  const partnerId = input.partnerId ?? (await sandboxPartner(tx)).id;
  const [u] = await tx<AppUser[]>`
    insert into pv.users (id, email, partner_id, display_name, country, currency, locale)
    values (${input.id}, ${input.email}, ${partnerId}, ${input.displayName.trim().slice(0, 60)},
            ${pack.code}, ${pack.currency.code}, ${input.locale})
    on conflict (id) do update set display_name = excluded.display_name
    returning *`;
  await tx`insert into pv.credit_profiles (user_id, partner_id) values (${u.id}, ${partnerId})
           on conflict (user_id) do nothing`;
  return normalize(u);
}

export async function updateProfile(
  tx: Db,
  userId: string,
  patch: { displayName?: string; locale?: "en" | "fr" },
): Promise<void> {
  if (patch.displayName !== undefined) {
    await tx`update pv.users set display_name = ${patch.displayName.trim().slice(0, 60)} where id = ${userId}`;
  }
  if (patch.locale) await tx`update pv.users set locale = ${patch.locale} where id = ${userId}`;
}

/** Turns on merchant mode and allocates the 8-byte merchant id used in QR requests. */
export async function enableMerchant(tx: Db, userId: string, name: string): Promise<Uint8Array> {
  const user = await userById(tx, userId);
  if (!user) throw new Error("User not found");
  const clean = name.trim().slice(0, 32) || user.display_name || "Merchant";
  if (user.merchant_id) {
    await tx`update pv.users set merchant_name = ${clean} where id = ${userId}`;
    return user.merchant_id;
  }
  for (let i = 0; i < 5; i++) {
    const mid = randomBytes(8);
    const rows = await tx`
      update pv.users set merchant_id = ${mid}, merchant_name = ${clean}
      where id = ${userId} and not exists (select 1 from pv.users where merchant_id = ${mid})
      returning id`;
    if (rows.length) return mid;
  }
  throw new Error("Could not allocate merchant id");
}

/**
 * KYC submission. In the sandbox partner, a well-formed ID number is accepted
 * as tier1 immediately; tier2 needs a partner review in the console.
 */
export async function submitKyc(tx: Db, userId: string, idType: string, idNumber: string): Promise<"tier1"> {
  const user = await userById(tx, userId);
  if (!user) throw new Error("User not found");
  const pack = packFor(user.country);
  if (!pack.kyc.idSystems.includes(idType)) throw new Error("Unsupported ID type for this country");
  if (!/^[A-Za-z0-9-]{6,24}$/.test(idNumber.trim())) throw new Error("Invalid ID number");
  if (user.kyc_tier === "tier0") await tx`update pv.users set kyc_tier = 'tier1' where id = ${userId}`;
  return "tier1";
}

export type Device = { id: string; user_id: string; public_key: Uint8Array; label: string; revoked_at: Date | null };

export async function registerDevice(tx: Db, userId: string, publicKey: Uint8Array, label: string): Promise<Device> {
  if (publicKey.length !== 33) throw new Error("Invalid device key");
  const [existing] = await tx<Device[]>`select * from pv.devices where public_key = ${publicKey}`;
  if (existing) {
    if (existing.user_id !== userId) throw new Error("Device key belongs to another user");
    return { ...existing, public_key: bytes(existing.public_key) };
  }
  const [d] = await tx<Device[]>`
    insert into pv.devices (user_id, public_key, label) values (${userId}, ${publicKey}, ${label.slice(0, 60)})
    returning *`;
  return { ...d, public_key: bytes(d.public_key) };
}

export async function deviceForUser(tx: Db, userId: string, deviceId: string): Promise<Device | undefined> {
  const [d] = await tx<Device[]>`select * from pv.devices where id = ${deviceId} and user_id = ${userId}`;
  return d && { ...d, public_key: bytes(d.public_key) };
}

export const merchantHex = (u: Pick<AppUser, "merchant_id">) => (u.merchant_id ? toHex(u.merchant_id) : null);

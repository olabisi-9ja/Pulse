import "server-only";
/** Offline vault lifecycle: issue, early close, expiry, revocation. */
import {
  type AllowanceCert,
  allowanceGenesis,
  decodeClose,
  encodeAllowance,
  importPublicKey,
  issueAllowance,
  toHex,
  verifyCloseSignature,
} from "@payvault/protocol";
import { creditSummary } from "./credit";
import { bytes, type Db } from "./db";
import { emit } from "./events";
import { deviceForUser, type Partner, partnerById, userById } from "./identity";
import { activeIssuer } from "./issuer";
import { accountId, balanceOf, postJournal, transfer } from "./ledger";
import { maxFunded, packFor } from "./policy";

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export type AllowanceRow = {
  id: Uint8Array;
  partner_id: string;
  user_id: string | null;
  external_ref: string | null;
  device_id: string | null;
  device_public_key: Uint8Array;
  issuer_kid: number;
  country: string;
  currency: string;
  funded: number;
  credit: number;
  per_tx_limit: number;
  max_payments: number;
  issued_at: Date;
  expires_at: Date;
  cert: Uint8Array;
  genesis: Uint8Array;
  status: "active" | "closing" | "closed" | "revoked";
  settled_funded: number;
  settled_credit: number;
  settled_loss: number;
  payments_count: number;
  declared_seq: number | null;
  declared_cumulative: number | null;
  refunded: number;
  closed_at: Date | null;
  created_at: Date;
};

export function normalizeAllowance(r: AllowanceRow): AllowanceRow {
  return {
    ...r,
    id: bytes(r.id),
    device_public_key: bytes(r.device_public_key),
    cert: bytes(r.cert),
    genesis: bytes(r.genesis),
  };
}

export async function lockAllowance(tx: Db, id: Uint8Array): Promise<AllowanceRow | undefined> {
  const [r] = await tx<AllowanceRow[]>`select * from pv.allowances where id = ${id} for update`;
  return r && normalizeAllowance(r);
}

async function storeAllowance(
  tx: Db,
  cert: AllowanceCert,
  extra: { partnerId: string; userId: string | null; deviceId: string | null; externalRef: string | null },
) {
  await tx`
    insert into pv.allowances (id, partner_id, user_id, external_ref, device_id, device_public_key, issuer_kid,
      country, currency, funded, credit, per_tx_limit, max_payments, issued_at, expires_at, cert, genesis)
    values (${cert.allowanceId}, ${extra.partnerId}, ${extra.userId}, ${extra.externalRef}, ${extra.deviceId},
      ${cert.devicePub}, ${cert.issuerKid}, ${cert.country}, ${cert.currency}, ${cert.funded}, ${cert.credit},
      ${cert.perTxLimit}, ${cert.maxPayments}, to_timestamp(${cert.issuedAt}), to_timestamp(${cert.expiresAt}),
      ${encodeAllowance(cert)}, ${await allowanceGenesis(cert)})`;
}

/**
 * Hosted mode: lock `funded` from the user's wallet into an offline vault on
 * one device, plus up to `credit` overdraft, and sign the certificate.
 */
export async function issueForUser(
  tx: Db,
  input: { userId: string; deviceId: string; funded: number; credit: number },
): Promise<AllowanceCert> {
  const user = await userById(tx, input.userId);
  if (!user) throw new ServiceError("not_found", "User not found", 404);
  if (user.status !== "active") throw new ServiceError("frozen", "Account is frozen", 403);
  const device = await deviceForUser(tx, user.id, input.deviceId);
  if (!device || device.revoked_at) throw new ServiceError("bad_device", "This device is not registered");
  if (!Number.isSafeInteger(input.funded) || !Number.isSafeInteger(input.credit) || input.funded < 0 || input.credit < 0) {
    throw new ServiceError("bad_amount", "Invalid amount");
  }
  if (input.funded + input.credit <= 0) throw new ServiceError("bad_amount", "Choose an amount to load");

  const [open] = await tx`select 1 from pv.allowances where device_id = ${device.id} and status = 'active'`;
  if (open) throw new ServiceError("vault_open", "This device already has an active offline vault");

  const pack = packFor(user.country);
  const fundedCap = maxFunded(pack, user.kyc_tier);
  if (input.funded > fundedCap) throw new ServiceError("over_limit", "Above your offline vault limit");
  if (input.credit > 0) {
    const credit = await creditSummary(tx, user);
    if (input.credit > credit.available) throw new ServiceError("over_credit", "Above your available overdraft");
  }

  const partner = (await partnerById(tx, user.partner_id))!;
  const wallet = await accountId(tx, partner.id, "wallet", user.currency, user.id);
  if ((await balanceOf(tx, wallet, true)) < input.funded) {
    throw new ServiceError("insufficient_funds", "Not enough money in your wallet");
  }

  const issuer = await activeIssuer(tx, partner.id);
  const now = Math.floor(Date.now() / 1000);
  const cert = await issueAllowance(issuer.privateKey, {
    issuerKid: issuer.kid,
    devicePub: device.public_key,
    country: pack.code,
    currency: pack.currency.code,
    funded: input.funded,
    credit: input.credit,
    perTxLimit: pack.offlineLimits.perTransaction,
    maxPayments: pack.offlineLimits.maxPaymentsPerAllowance,
    issuedAt: now,
    expiresAt: now + pack.offlineLimits.allowanceTtlHours * 3600,
  });
  await storeAllowance(tx, cert, { partnerId: partner.id, userId: user.id, deviceId: device.id, externalRef: null });
  if (input.funded > 0) {
    const vault = await accountId(tx, partner.id, "vault", user.currency, user.id);
    await postJournal(tx, {
      partnerId: partner.id,
      kind: "vault_load",
      ref: toHex(cert.allowanceId),
      postings: transfer(wallet, vault, input.funded),
    });
  }
  await emit(tx, partner.id, "allowance.issued", allowanceEvent(cert, user.id));
  return cert;
}

/**
 * External-ledger mode (partner API): the partner has already locked funds and
 * approved credit in its own systems; PayVault signs and tracks the allowance.
 */
export async function issueForPartner(
  tx: Db,
  partner: Partner,
  input: {
    devicePublicKey: Uint8Array;
    country: string;
    funded: number;
    credit: number;
    externalRef: string;
    ttlHours?: number;
  },
): Promise<AllowanceCert> {
  const pack = packFor(input.country);
  if (input.funded + input.credit > pack.offlineLimits.allowanceCap) {
    throw new ServiceError("over_limit", `Allowance exceeds the ${pack.code} offline cap`);
  }
  const issuer = await activeIssuer(tx, partner.id);
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.min(input.ttlHours ?? pack.offlineLimits.allowanceTtlHours, pack.offlineLimits.allowanceTtlHours);
  const cert = await issueAllowance(issuer.privateKey, {
    issuerKid: issuer.kid,
    devicePub: input.devicePublicKey,
    country: pack.code,
    currency: pack.currency.code,
    funded: input.funded,
    credit: input.credit,
    perTxLimit: pack.offlineLimits.perTransaction,
    maxPayments: pack.offlineLimits.maxPaymentsPerAllowance,
    issuedAt: now,
    expiresAt: now + ttl * 3600,
  });
  await storeAllowance(tx, cert, { partnerId: partner.id, userId: null, deviceId: null, externalRef: input.externalRef });
  await emit(tx, partner.id, "allowance.issued", { ...allowanceEvent(cert, null), externalRef: input.externalRef });
  return cert;
}

function allowanceEvent(cert: AllowanceCert, userId: string | null) {
  return {
    allowanceId: toHex(cert.allowanceId),
    userId,
    currency: cert.currency,
    funded: cert.funded,
    credit: cert.credit,
    expiresAt: new Date(cert.expiresAt * 1000).toISOString(),
  };
}

/** Funded value still sitting in the vault that is not reserved for unsynced payments. */
function refundable(a: AllowanceRow, reserveFor: number): number {
  const fundedNeeded = Math.min(a.funded, reserveFor);
  return Math.max(0, a.funded - Math.max(fundedNeeded, a.settled_funded) - a.refunded);
}

async function refund(tx: Db, a: AllowanceRow, amount: number, reason: string) {
  if (amount <= 0 || !a.user_id) return;
  const partner = (await partnerById(tx, a.partner_id))!;
  if (partner.ledger_mode === "hosted") {
    const vault = await accountId(tx, a.partner_id, "vault", a.currency, a.user_id);
    const wallet = await accountId(tx, a.partner_id, "wallet", a.currency, a.user_id);
    await postJournal(tx, { partnerId: a.partner_id, kind: reason, ref: toHex(a.id), postings: transfer(vault, wallet, amount) });
  }
  await tx`update pv.allowances set refunded = refunded + ${amount} where id = ${a.id}`;
}

/**
 * Early cash-out. The device signs where it stopped (seq, cumulative); value
 * above that returns to the wallet now, the rest waits for its payments.
 */
export async function closeWithStatement(
  tx: Db,
  closeBytes: Uint8Array,
  actor: { userId?: string; partnerId?: string },
): Promise<AllowanceRow> {
  let close;
  try {
    close = decodeClose(closeBytes);
  } catch {
    throw new ServiceError("decode", "Malformed close statement");
  }
  const a = await lockAllowance(tx, close.allowanceId);
  if (!a) throw new ServiceError("not_found", "Unknown allowance", 404);
  if ((actor.userId && a.user_id !== actor.userId) || (actor.partnerId && a.partner_id !== actor.partnerId)) {
    throw new ServiceError("forbidden", "Not your allowance", 403);
  }
  if (!(await verifyCloseSignature(close, await importPublicKey(a.device_public_key)))) {
    throw new ServiceError("bad_signature", "Close statement signature is invalid");
  }
  if (a.status !== "active") return a;

  await tx`update pv.allowances set status = 'closing', declared_seq = ${close.seq},
           declared_cumulative = ${close.cumulative} where id = ${a.id}`;
  const updated = { ...a, status: "closing" as const, declared_seq: close.seq, declared_cumulative: close.cumulative };
  await refund(tx, updated, refundable(updated, close.cumulative), "vault_cashout");
  await maybeFinishClosing(tx, a.id);
  return (await lockAllowance(tx, a.id))!;
}

/** A closing allowance is closed once every declared payment has arrived. */
export async function maybeFinishClosing(tx: Db, id: Uint8Array): Promise<void> {
  const a = await lockAllowance(tx, id);
  if (!a || a.status !== "closing" || a.declared_seq === null) return;
  const [{ n }] = await tx<{ n: number }[]>`
    select count(distinct seq)::int as n from pv.payments where allowance_id = ${id} and seq <= ${a.declared_seq}`;
  if (n >= a.declared_seq) {
    await tx`update pv.allowances set status = 'closed', closed_at = now() where id = ${id}`;
    await emit(tx, a.partner_id, "allowance.closed", { allowanceId: toHex(id), reason: "cashout" });
  }
}

/** Returns unspent value from vaults past expiry + grace. Run on a schedule. */
export async function sweepExpired(tx: Db): Promise<number> {
  const rows = await tx<AllowanceRow[]>`
    select * from pv.allowances
    where status in ('active', 'closing')
      and expires_at + make_interval(hours => 24) < now()
    order by expires_at limit 200 for update skip locked`;
  for (const raw of rows) {
    const a = normalizeAllowance(raw);
    await refund(tx, a, Math.max(0, a.funded - a.settled_funded - a.refunded), "vault_expiry");
    await tx`update pv.allowances set status = 'closed', closed_at = now() where id = ${a.id}`;
    await emit(tx, a.partner_id, "allowance.closed", { allowanceId: toHex(a.id), reason: "expired" });
  }
  return rows.length;
}

export async function revokeAllowance(tx: Db, a: AllowanceRow, reason: string): Promise<void> {
  if (a.status === "revoked") return;
  await tx`update pv.allowances set status = 'revoked', closed_at = now() where id = ${a.id}`;
  await tx`insert into pv.revocations (allowance_id, partner_id, reason) values (${a.id}, ${a.partner_id}, ${reason})
           on conflict do nothing`;
  await emit(tx, a.partner_id, "allowance.revoked", { allowanceId: toHex(a.id), reason });
}

export async function revocationsSince(tx: Db, since: Date): Promise<{ allowanceId: string; at: string }[]> {
  const rows = await tx<{ allowance_id: Buffer; created_at: Date }[]>`
    select allowance_id, created_at from pv.revocations
    where created_at > ${since} and created_at > now() - interval '30 days'
    order by created_at limit 5000`;
  return rows.map((r) => ({ allowanceId: toHex(bytes(r.allowance_id)), at: r.created_at.toISOString() }));
}

export async function allowancesForUser(tx: Db, userId: string, limit = 20): Promise<AllowanceRow[]> {
  const rows = await tx<AllowanceRow[]>`
    select * from pv.allowances where user_id = ${userId} order by created_at desc limit ${limit}`;
  return rows.map(normalizeAllowance);
}

import "server-only";
/**
 * Ingests offline payments (from merchants, payers, couriers or partner API),
 * settles them, draws overdraft, and detects fraud. Each payment is processed
 * in its own transaction holding a lock on its allowance.
 */
import {
  analyzeAllowance,
  capOf,
  decodeAllowance,
  decodeBundle,
  decodePayment,
  encodeAllowance,
  encodePayment,
  equals,
  importPublicKey,
  paymentId,
  toHex,
  verifyPaymentSignature,
} from "@payvault/protocol";
import { type AllowanceRow, lockAllowance, maybeFinishClosing, revokeAllowance } from "./allowances";
import { drawCredit } from "./credit";
import { bytes, type Db, type Sql } from "./db";
import { emit } from "./events";
import { type AppUser, partnerById, userByMerchantId } from "./identity";
import { accountId, balanceOf, type Posting, postJournal } from "./ledger";

export type Submitter =
  | { kind: "user"; userId: string }
  | { kind: "api"; partnerId: string };

export type IngestResult = {
  id?: string;
  allowanceId?: string;
  status: "settled" | "flagged" | "duplicate" | "rejected";
  code?: string;
  amount?: number;
  currency?: string;
  merchantUserId?: string | null;
  payerUserId?: string | null;
};

const SKEW = 300;

export async function ingestBundles(sql: Sql, submitter: Submitter, bundles: Uint8Array[]): Promise<IngestResult[]> {
  const out: IngestResult[] = [];
  for (const b of bundles.slice(0, 500)) {
    try {
      out.push(await sql.begin((tx) => ingestOne(tx, submitter, b)));
    } catch (err) {
      if (err instanceof RejectError) out.push({ status: "rejected", code: err.code });
      else throw err;
    }
  }
  return out;
}

class RejectError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

async function ingestOne(tx: Db, submitter: Submitter, raw: Uint8Array): Promise<IngestResult> {
  let bundle;
  try {
    bundle = decodeBundle(raw);
  } catch {
    throw new RejectError("decode");
  }
  const { cert, payment: p } = bundle;
  const allowanceId = toHex(cert.allowanceId);
  const reject = (code: string): IngestResult => ({ status: "rejected", code, allowanceId });

  const a = await lockAllowance(tx, cert.allowanceId);
  if (!a) return reject("unknown_allowance");
  // The certificate must be byte-identical to what the partner issued.
  if (!equals(encodeAllowance(cert), a.cert)) return reject("cert_mismatch");
  if (!equals(p.allowanceId, a.id)) return reject("wrong_allowance");
  if (!(await verifyPaymentSignature(p, await importPublicKey(a.device_public_key)))) {
    return reject("bad_payer_signature");
  }

  const id = await paymentId(p);
  const idHex = toHex(id);
  const [dup] = await tx`select status from pv.payments where id = ${id}`;
  if (dup) return { id: idHex, allowanceId, status: "duplicate", code: String(dup.status) };

  // The guarantee covers payments a merchant could have accepted offline.
  if (p.seq < 1 || p.amount <= 0 || p.cumulative < p.amount) return reject("bad_amount");
  if (p.amount > a.per_tx_limit) return reject("over_tx_limit");
  if (p.cumulative > capOf(cert)) return reject("over_cap");
  if (p.seq > a.max_payments) return reject("too_many_payments");
  if (p.time > cert.expiresAt + SKEW) return reject("expired");

  const merchant = await userByMerchantId(tx, p.merchantId);
  const payerPartner = (await partnerById(tx, a.partner_id))!;
  if (!merchant && payerPartner.ledger_mode === "hosted") return reject("unknown_merchant");
  if (submitter.kind === "api" && submitter.partnerId !== a.partner_id && submitter.partnerId !== merchant?.partner_id) {
    return reject("forbidden");
  }

  const receivedVia =
    submitter.kind === "api"
      ? "api"
      : submitter.userId === merchant?.id
        ? "merchant"
        : submitter.userId === a.user_id
          ? "payer"
          : "courier";

  // Allocate: funded value first, then overdraft, then (for late payments on a
  // refunded vault) the holder's wallet, and only then the risk pool.
  let rem = p.amount;
  const fromFunded = Math.min(rem, Math.max(0, a.funded - a.settled_funded - a.refunded));
  rem -= fromFunded;
  const fromCredit = Math.min(rem, Math.max(0, a.credit - a.settled_credit));
  rem -= fromCredit;
  let fromWallet = 0;
  if (rem > 0 && a.user_id && payerPartner.ledger_mode === "hosted") {
    const wallet = await accountId(tx, a.partner_id, "wallet", a.currency, a.user_id);
    fromWallet = Math.min(rem, Math.max(0, await balanceOf(tx, wallet, true)));
    rem -= fromWallet;
  }
  const fromRisk = rem;

  let journalId: string | null = null;
  if (payerPartner.ledger_mode === "hosted") {
    journalId = await postSettlement(tx, a, merchant, p.amount, { fromFunded, fromCredit, fromWallet, fromRisk }, idHex);
  }

  await tx`
    insert into pv.payments (id, allowance_id, partner_id, seq, amount, cumulative, merchant_id, merchant_user_id,
      payer_user_id, nonce, device_time, encoded, from_funded, from_credit, from_risk_pool, status, journal_id, received_via)
    values (${id}, ${a.id}, ${a.partner_id}, ${p.seq}, ${p.amount}, ${p.cumulative}, ${p.merchantId},
      ${merchant?.id ?? null}, ${a.user_id}, ${p.nonce}, to_timestamp(${p.time}), ${encodePayment(p)},
      ${fromFunded + fromWallet}, ${fromCredit}, ${fromRisk}, 'settled', ${journalId}, ${receivedVia})`;
  await tx`
    update pv.allowances set
      settled_funded = settled_funded + ${fromFunded + fromWallet},
      refunded = refunded - ${fromWallet},
      settled_credit = settled_credit + ${fromCredit},
      settled_loss = settled_loss + ${fromRisk},
      payments_count = payments_count + 1
    where id = ${a.id}`;
  if (fromCredit > 0) await drawCredit(tx, payerPartner, a, fromCredit);

  const flagged = await detectFraud(tx, a, idHex, p.seq);
  await maybeFinishClosing(tx, a.id);

  const event = {
    paymentId: idHex,
    allowanceId,
    amount: p.amount,
    currency: a.currency,
    merchantId: toHex(p.merchantId),
    seq: p.seq,
    fromFunded: fromFunded + fromWallet,
    fromCredit,
    fromRiskPool: fromRisk,
  };
  await emit(tx, a.partner_id, flagged ? "payment.flagged" : "payment.settled", event);
  if (merchant && merchant.partner_id !== a.partner_id) {
    await emit(tx, merchant.partner_id, "payment.settled", event);
  }

  return {
    id: idHex,
    allowanceId,
    status: flagged ? "flagged" : "settled",
    amount: p.amount,
    currency: a.currency,
    merchantUserId: merchant?.id ?? null,
    payerUserId: a.user_id,
  };
}

async function postSettlement(
  tx: Db,
  a: AllowanceRow,
  merchant: AppUser | undefined,
  amount: number,
  parts: { fromFunded: number; fromCredit: number; fromWallet: number; fromRisk: number },
  ref: string,
): Promise<string> {
  const pid = a.partner_id;
  const sources: Posting[] = [];
  if (parts.fromFunded) sources.push({ account: await accountId(tx, pid, "vault", a.currency, a.user_id), amount: -parts.fromFunded });
  if (parts.fromCredit) sources.push({ account: await accountId(tx, pid, "credit_receivable", a.currency), amount: -parts.fromCredit });
  if (parts.fromWallet) sources.push({ account: await accountId(tx, pid, "wallet", a.currency, a.user_id), amount: -parts.fromWallet });
  if (parts.fromRisk) sources.push({ account: await accountId(tx, pid, "risk_pool", a.currency), amount: -parts.fromRisk });

  if (!merchant) throw new Error("Hosted settlement needs a merchant");
  if (merchant.partner_id === pid) {
    const dest = await accountId(tx, pid, "merchant", a.currency, merchant.id);
    return postJournal(tx, {
      partnerId: pid,
      kind: "offline_payment",
      ref,
      postings: [...sources, { account: dest, amount }],
    });
  }
  // Cross-partner: clear out of the payer's partner, into the merchant's partner.
  const clearingOut = await accountId(tx, pid, "payout", a.currency);
  const journalId = await postJournal(tx, {
    partnerId: pid,
    kind: "offline_payment_out",
    ref,
    postings: [...sources, { account: clearingOut, amount }],
  });
  const clearingIn = await accountId(tx, merchant.partner_id, "funding", a.currency);
  const dest = await accountId(tx, merchant.partner_id, "merchant", a.currency, merchant.id);
  await postJournal(tx, {
    partnerId: merchant.partner_id,
    kind: "offline_payment_in",
    ref,
    postings: [
      { account: clearingIn, amount: -amount },
      { account: dest, amount },
    ],
  });
  return journalId;
}

/**
 * Re-analyses the whole allowance after a new payment. Forks, broken chains,
 * spending above the cap, or spending after a signed close revoke the
 * allowance and open fraud cases. Returns whether the new payment is implicated.
 */
async function detectFraud(tx: Db, a: AllowanceRow, newId: string, newSeq: number): Promise<boolean> {
  const rows = await tx<{ id: Buffer; encoded: Buffer }[]>`
    select id, encoded from pv.payments where allowance_id = ${a.id}`;
  const cert = decodeAllowance(a.cert);
  const entries = rows.map((r) => ({ id: toHex(bytes(r.id)), payment: decodePayment(bytes(r.encoded)) }));
  const res = analyzeAllowance(cert, toHex(a.genesis), entries);
  const [fresh] = await tx<{ settled_loss: number; declared_seq: number | null }[]>`
    select settled_loss, declared_seq from pv.allowances where id = ${a.id}`;

  const cases: { kind: string; seq: number; ids: string[]; loss: number }[] = [];
  for (const f of res.forks) cases.push({ kind: "fork", seq: f.seq, ids: f.ids, loss: 0 });
  for (const b of res.breaks) cases.push({ kind: "chain_break", seq: b.seq, ids: [b.id], loss: 0 });
  if (res.overspend > 0 || fresh.settled_loss > 0) {
    cases.push({ kind: "overspend", seq: 0, ids: [], loss: fresh.settled_loss });
  }
  if (fresh.declared_seq !== null && newSeq > fresh.declared_seq) {
    cases.push({ kind: "after_close", seq: newSeq, ids: [newId], loss: 0 });
  }
  if (!cases.length) return false;

  for (const c of cases) {
    await tx`
      insert into pv.fraud_cases (partner_id, allowance_id, kind, seq, payment_ids, loss)
      values (${a.partner_id}, ${a.id}, ${c.kind}, ${c.seq},
        coalesce((select array_agg(decode(h, 'hex')) from unnest(${c.ids}::text[]) h), '{}'), ${c.loss})
      on conflict (allowance_id, kind, seq) do update set payment_ids = excluded.payment_ids, loss = excluded.loss`;
  }
  const implicated = new Set(cases.flatMap((c) => c.ids));
  for (const h of implicated) {
    await tx`update pv.payments set status = 'flagged' where id = ${Buffer.from(h, "hex")}`;
  }
  const serious = cases.some((c) => c.kind !== "overspend" || c.loss > 0);
  if (serious) {
    await revokeAllowance(tx, a, cases[0].kind);
    if (a.user_id) {
      await tx`update pv.credit_profiles set status = 'frozen', credit_limit = 0, updated_at = now() where user_id = ${a.user_id}`;
    }
    await emit(tx, a.partner_id, "fraud.detected", {
      allowanceId: toHex(a.id),
      userId: a.user_id,
      cases: cases.map((c) => ({ kind: c.kind, seq: c.seq, paymentIds: c.ids, loss: c.loss })),
    });
  }
  return implicated.has(newId);
}

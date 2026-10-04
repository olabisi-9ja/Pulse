import "server-only";
/**
 * CashTap: online tap payments from a user's wallet to a merchant, settled
 * instantly on the hosted ledger. Needs a connection; offline payments go
 * through the vault protocol instead.
 */
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { Db } from "./db";
import { emit } from "./events";
import type { AppUser } from "./identity";
import { accountId, balanceOf, postJournal, transfer } from "./ledger";

export class TapPaymentError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export type CashTapPan = {
  id: string;
  userId: string;
  pan: string;
  maskedPan: string;
  expiry: string;
  status: "active" | "suspended" | "revoked";
  createdAt: string;
};

type PanRow = { id: string; user_id: string; pan: string; expiry: string; status: CashTapPan["status"]; created_at: Date };

function toPan(r: PanRow): CashTapPan {
  return {
    id: r.id,
    userId: r.user_id,
    pan: r.pan,
    maskedPan: `•••• •••• •••• ${r.pan.slice(-4)}`,
    expiry: r.expiry,
    status: r.status,
    createdAt: r.created_at.toISOString(),
  };
}

function luhnDigit(partial: string): number {
  let sum = 0;
  for (let i = 0; i < partial.length; i++) {
    let d = Number(partial[partial.length - 1 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** 16-digit Luhn-valid number in the 9xxx private-use range, so it can never collide with a real card scheme. */
function newPan(): string {
  let body = "9990";
  while (body.length < 15) body += String(randomInt(10));
  return body + luhnDigit(body);
}

export async function getOrProvisionPan(tx: Db, user: AppUser): Promise<CashTapPan> {
  const [existing] = await tx<PanRow[]>`
    select * from pv.cashafrica_pans where user_id = ${user.id} and status = 'active' for update`;
  if (existing) return toPan(existing);
  const exp = new Date();
  exp.setUTCFullYear(exp.getUTCFullYear() + 3);
  const expiry = `${String(exp.getUTCMonth() + 1).padStart(2, "0")}/${String(exp.getUTCFullYear()).slice(-2)}`;
  const [row] = await tx<PanRow[]>`
    insert into pv.cashafrica_pans (user_id, pan, expiry) values (${user.id}, ${newPan()}, ${expiry})
    returning *`;
  return toPan(row);
}

export type TapTransport = "nfc" | "cashscan" | "tap_simulate";

export type TapResult = {
  ref: string;
  status: "completed";
  amount: number;
  currency: string;
  transport: TapTransport;
  settledAt: string;
};

export async function executeTapPayment(
  tx: Db,
  input: {
    payer: AppUser;
    merchant: AppUser;
    amount: number;
    currency: string;
    transport?: TapTransport;
    metadata?: Record<string, unknown>;
  },
): Promise<TapResult> {
  const { payer, merchant, amount, currency } = input;
  const transport = input.transport ?? "nfc";
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new TapPaymentError("bad_amount", "Invalid amount");
  if (payer.id === merchant.id) throw new TapPaymentError("self_payment", "You can't pay yourself");
  if (!merchant.merchant_id) throw new TapPaymentError("not_merchant", "This user doesn't accept payments");
  if (payer.status !== "active" || merchant.status !== "active") throw new TapPaymentError("frozen", "Account is frozen");
  if (currency !== payer.currency || currency !== merchant.currency) {
    throw new TapPaymentError("currency_mismatch", "Merchant uses another currency");
  }

  const src = await accountId(tx, payer.partner_id, "wallet", currency, payer.id);
  if ((await balanceOf(tx, src, true)) < amount) throw new TapPaymentError("insufficient_funds", "Not enough money");
  const dst = await accountId(tx, merchant.partner_id, "merchant", currency, merchant.id);
  const ref = `ca_tap_${randomBytes(9).toString("hex")}`;
  const memo = merchant.merchant_name ?? undefined;

  if (payer.partner_id === merchant.partner_id) {
    await postJournal(tx, { partnerId: payer.partner_id, kind: "tap_payment", ref, memo, postings: transfer(src, dst, amount) });
  } else {
    const out = await accountId(tx, payer.partner_id, "payout", currency);
    const inn = await accountId(tx, merchant.partner_id, "funding", currency);
    await postJournal(tx, { partnerId: payer.partner_id, kind: "tap_payment_out", ref, memo, postings: transfer(src, out, amount) });
    await postJournal(tx, { partnerId: merchant.partner_id, kind: "tap_payment_in", ref, postings: transfer(inn, dst, amount) });
  }

  const [row] = await tx<{ settled_at: Date }[]>`
    insert into pv.cashafrica_transactions (ref, user_id, merchant_user_id, amount, currency, transport, status, metadata, settled_at)
    values (${ref}, ${payer.id}, ${merchant.id}, ${amount}, ${currency}, ${transport}, 'completed',
      ${tx.json((input.metadata ?? {}) as never)}, now())
    returning settled_at`;
  await emit(tx, merchant.partner_id, "cashtap.payment.settled", { ref, amount, currency, transport });

  return { ref, status: "completed", amount, currency, transport, settledAt: row.settled_at.toISOString() };
}

/**
 * HMAC-SHA256 (hex) of the raw body with CASHAFRICA_WEBHOOK_SECRET. Without a
 * secret, accepts in development and test only.
 */
export function verifyCashAfricaWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CASHAFRICA_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

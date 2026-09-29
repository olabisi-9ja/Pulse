import "server-only";
/** Online wallet operations and read models for the app. */
import { toHex } from "@payvault/protocol";
import { ServiceError } from "./allowances";
import { repayFromWallet } from "./credit";
import { bytes, type Db } from "./db";
import { type AppUser, partnerById, userByEmail, userById } from "./identity";
import { accountId, balanceOf, postJournal, transfer } from "./ledger";
import { packFor } from "./policy";

async function mustUser(tx: Db, userId: string): Promise<AppUser> {
  const u = await userById(tx, userId);
  if (!u) throw new ServiceError("not_found", "User not found", 404);
  if (u.status !== "active") throw new ServiceError("frozen", "Account is frozen", 403);
  return u;
}

function checkAmount(amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new ServiceError("bad_amount", "Invalid amount");
}

/**
 * Adds test money. Only the sandbox partner has a faucet; real partners fund
 * wallets through their own rails and the API.
 */
export async function sandboxTopUp(tx: Db, userId: string, amount: number): Promise<void> {
  checkAmount(amount);
  const user = await mustUser(tx, userId);
  const partner = (await partnerById(tx, user.partner_id))!;
  if (partner.kind !== "sandbox") throw new ServiceError("forbidden", "Top-ups come from your provider", 403);
  const cap = packFor(user.country).offlineLimits.allowanceCap * 5;
  if (amount > cap) throw new ServiceError("over_limit", "Test top-up is too large");
  const funding = await accountId(tx, partner.id, "funding", user.currency);
  const wallet = await accountId(tx, partner.id, "wallet", user.currency, user.id);
  await postJournal(tx, { partnerId: partner.id, kind: "topup", memo: "Test funds", postings: transfer(funding, wallet, amount) });
  await repayFromWallet(tx, user.id);
}

/** Online transfer to another PayVault user of the same currency. */
export async function sendToUser(tx: Db, fromId: string, toEmail: string, amount: number, note = ""): Promise<void> {
  checkAmount(amount);
  const from = await mustUser(tx, fromId);
  const to = await userByEmail(tx, toEmail.trim());
  if (!to) throw new ServiceError("recipient_not_found", "No PayVault user with that email");
  if (to.id === from.id) throw new ServiceError("self_transfer", "You can't send money to yourself");
  if (to.currency !== from.currency) throw new ServiceError("currency_mismatch", "Recipient uses another currency");
  const src = await accountId(tx, from.partner_id, "wallet", from.currency, from.id);
  if ((await balanceOf(tx, src, true)) < amount) throw new ServiceError("insufficient_funds", "Not enough money");
  const dst = await accountId(tx, to.partner_id, "wallet", to.currency, to.id);
  const memo = note.trim().slice(0, 80) || null;
  if (from.partner_id === to.partner_id) {
    await postJournal(tx, { partnerId: from.partner_id, kind: "transfer", ref: to.id, memo: memo ?? undefined, postings: transfer(src, dst, amount) });
  } else {
    const out = await accountId(tx, from.partner_id, "payout", from.currency);
    const inn = await accountId(tx, to.partner_id, "funding", to.currency);
    await postJournal(tx, { partnerId: from.partner_id, kind: "transfer_out", ref: to.id, postings: transfer(src, out, amount) });
    await postJournal(tx, { partnerId: to.partner_id, kind: "transfer_in", ref: from.id, postings: transfer(inn, dst, amount) });
  }
  await repayFromWallet(tx, to.id);
}

/** Moves merchant takings into the personal wallet. */
export async function sweepMerchant(tx: Db, userId: string, amount?: number): Promise<number> {
  const user = await mustUser(tx, userId);
  const merchant = await accountId(tx, user.partner_id, "merchant", user.currency, user.id);
  const wallet = await accountId(tx, user.partner_id, "wallet", user.currency, user.id);
  const bal = await balanceOf(tx, merchant, true);
  const amt = Math.min(bal, amount ?? bal);
  if (amt <= 0) return 0;
  await postJournal(tx, { partnerId: user.partner_id, kind: "merchant_sweep", postings: transfer(merchant, wallet, amt) });
  await repayFromWallet(tx, user.id);
  return amt;
}

export type Balances = { wallet: number; vault: number; merchant: number; currency: string };

export async function balances(tx: Db, user: AppUser): Promise<Balances> {
  const rows = await tx<{ kind: string; balance: number }[]>`
    select kind, balance from pv.accounts
    where partner_id = ${user.partner_id} and user_id = ${user.id} and currency = ${user.currency}`;
  const get = (k: string) => rows.find((r) => r.kind === k)?.balance ?? 0;
  return { wallet: get("wallet"), vault: get("vault"), merchant: get("merchant"), currency: user.currency };
}

export type ActivityItem = {
  id: string;
  kind: string;
  account: string;
  amount: number;
  currency: string;
  memo: string | null;
  ref: string | null;
  at: string;
  counterparty?: string | null;
  offline?: { seq: number; fromCredit: number; status: string } | null;
};

/** Ledger-backed activity feed across the user's wallet, vault and merchant accounts. */
export async function activity(tx: Db, user: AppUser, limit = 50): Promise<ActivityItem[]> {
  const rows = await tx<
    {
      posting_id: number;
      kind: string;
      account_kind: string;
      amount: number;
      currency: string;
      memo: string | null;
      ref: string | null;
      created_at: Date;
    }[]
  >`
    select p.id as posting_id, j.kind, a.kind as account_kind, p.amount, a.currency, j.memo, j.ref, j.created_at
    from pv.postings p
    join pv.accounts a on a.id = p.account_id
    join pv.journal j on j.id = p.journal_id
    where a.user_id = ${user.id}
    order by p.id desc
    limit ${limit}`;
  const paymentRefs = rows.filter((r) => r.kind.startsWith("offline_payment") && r.ref).map((r) => Buffer.from(r.ref!, "hex"));
  const payments = paymentRefs.length
    ? await tx<{ id: Buffer; seq: number; from_credit: number; status: string; merchant_name: string | null; payer_name: string | null }[]>`
        select p.id, p.seq, p.from_credit, p.status, m.merchant_name, u.display_name as payer_name
        from pv.payments p
        left join pv.users m on m.id = p.merchant_user_id
        left join pv.users u on u.id = p.payer_user_id
        where p.id in ${tx(paymentRefs)}`
    : [];
  const byId = new Map(payments.map((p) => [toHex(bytes(p.id)), p]));
  const transferRefs = rows.filter((r) => r.kind.startsWith("transfer") && r.ref).map((r) => r.ref!);
  const people = transferRefs.length
    ? await tx<{ id: string; display_name: string }[]>`select id, display_name from pv.users where id::text in ${tx(transferRefs)}`
    : [];
  const names = new Map(people.map((p) => [p.id, p.display_name]));

  return rows.map((r) => {
    const pay = r.ref ? byId.get(r.ref) : undefined;
    return {
      id: String(r.posting_id),
      kind: r.kind,
      account: r.account_kind,
      amount: r.amount,
      currency: r.currency,
      memo: r.memo,
      ref: r.ref,
      at: r.created_at.toISOString(),
      counterparty: pay ? (r.account_kind === "merchant" ? pay.payer_name : pay.merchant_name) : r.ref ? names.get(r.ref) ?? null : null,
      offline: pay ? { seq: pay.seq, fromCredit: pay.from_credit, status: pay.status } : null,
    };
  });
}

import "server-only";
/**
 * Hosted double-entry ledger. Every journal's postings sum to zero.
 * Balances are signed: positive means owed to the account holder; system
 * accounts (funding, credit_receivable, risk_pool) go negative as they pay out.
 */
import type { Db } from "./db";

export type AccountKind =
  | "wallet"
  | "vault"
  | "merchant"
  | "credit_receivable"
  | "risk_pool"
  | "funding"
  | "fee_income"
  | "payout";

const NO_USER = "00000000-0000-0000-0000-000000000000";

export async function accountId(
  tx: Db,
  partnerId: string,
  kind: AccountKind,
  currency: string,
  userId: string | null = null,
): Promise<string> {
  const [row] = await tx<{ id: string }[]>`
    insert into pv.accounts (partner_id, user_id, kind, currency)
    values (${partnerId}, ${userId}, ${kind}, ${currency})
    on conflict (partner_id, coalesce(user_id, ${NO_USER}::uuid), kind, currency) do update set kind = excluded.kind
    returning id`;
  return row.id;
}

export async function balanceOf(tx: Db, accountIdValue: string, lock = false): Promise<number> {
  const rows = lock
    ? await tx<{ balance: number }[]>`select balance from pv.accounts where id = ${accountIdValue} for update`
    : await tx<{ balance: number }[]>`select balance from pv.accounts where id = ${accountIdValue}`;
  return rows[0]?.balance ?? 0;
}

export type Posting = { account: string; amount: number };

export async function postJournal(
  tx: Db,
  entry: { partnerId: string; kind: string; ref?: string; memo?: string; postings: Posting[] },
): Promise<string> {
  const postings = entry.postings.filter((p) => p.amount !== 0);
  const sum = postings.reduce((n, p) => n + p.amount, 0);
  if (sum !== 0) throw new Error(`Unbalanced journal ${entry.kind}: ${sum}`);
  for (const p of postings) {
    if (!Number.isSafeInteger(p.amount)) throw new Error("Posting amount must be a safe integer");
  }
  const [j] = await tx<{ id: string }[]>`
    insert into pv.journal (partner_id, kind, ref, memo)
    values (${entry.partnerId}, ${entry.kind}, ${entry.ref ?? null}, ${entry.memo ?? null})
    returning id`;
  for (const p of postings) {
    await tx`insert into pv.postings (journal_id, account_id, amount) values (${j.id}, ${p.account}, ${p.amount})`;
    await tx`update pv.accounts set balance = balance + ${p.amount} where id = ${p.account}`;
  }
  return j.id;
}

/** Moves `amount` from one account to another in a single journal. */
export function transfer(from: string, to: string, amount: number): Posting[] {
  return [
    { account: from, amount: -amount },
    { account: to, amount },
  ];
}

import "server-only";
/** Offline overdraft: credit profiles, availability, loans and repayment. */
import type { Db } from "./db";
import { type AppUser, type Partner, userById } from "./identity";
import { accountId, balanceOf, postJournal, transfer } from "./ledger";
import { creditDecision, loanFee, packFor } from "./policy";
import { emit } from "./events";

export type CreditProfile = { user_id: string; credit_limit: number; score: number; status: "active" | "frozen" };

export async function refreshCreditProfile(tx: Db, user: AppUser): Promise<CreditProfile> {
  const [h] = await tx<
    { on_time: number; late: number; overdue: number; fraud: number; settled: number }[]
  >`
    select
      (select count(*)::int from pv.loans where user_id = ${user.id} and status = 'repaid' and updated_at <= due_at) as on_time,
      (select count(*)::int from pv.loans where user_id = ${user.id} and status = 'repaid' and updated_at > due_at) as late,
      (select count(*)::int from pv.loans where user_id = ${user.id} and (status = 'overdue' or (status = 'open' and due_at < now()))) as overdue,
      (select count(*)::int from pv.fraud_cases f join pv.allowances a on a.id = f.allowance_id where a.user_id = ${user.id}) as fraud,
      (select count(*)::int from pv.payments where payer_user_id = ${user.id}) as settled`;
  const ageDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000);
  const d = creditDecision(packFor(user.country), {
    tier: user.kyc_tier,
    accountAgeDays: ageDays,
    loansRepaidOnTime: h.on_time,
    loansRepaidLate: h.late,
    openOverdue: h.overdue,
    fraudCases: h.fraud,
    settledPayments: h.settled,
  });
  const status = d.reason === "fraud" ? "frozen" : "active";
  const [p] = await tx<CreditProfile[]>`
    insert into pv.credit_profiles (user_id, partner_id, credit_limit, score, status, updated_at)
    values (${user.id}, ${user.partner_id}, ${d.limit}, ${d.score}, ${status}, now())
    on conflict (user_id) do update set credit_limit = excluded.credit_limit, score = excluded.score,
      status = case when pv.credit_profiles.status = 'frozen' then 'frozen' else excluded.status end,
      updated_at = now()
    returning user_id, credit_limit, score, status`;
  return p;
}

export type CreditSummary = CreditProfile & {
  outstanding: number;
  reserved: number;
  available: number;
  reason: string;
};

/** Overdraft the user could put into a new vault right now. */
export async function creditSummary(tx: Db, user: AppUser): Promise<CreditSummary> {
  const profile = await refreshCreditProfile(tx, user);
  const [r] = await tx<{ outstanding: number; reserved: number }[]>`
    select
      coalesce((select sum(principal + fee - repaid) from pv.loans
                where user_id = ${user.id} and status in ('open', 'overdue')), 0)::bigint as outstanding,
      coalesce((select sum(case
                  when status = 'active' then credit - settled_credit
                  when status = 'closing' then greatest(0, least(credit, greatest(0, declared_cumulative - funded)) - settled_credit)
                  else 0 end)
                from pv.allowances where user_id = ${user.id}), 0)::bigint as reserved`;
  const available =
    profile.status === "frozen" ? 0 : Math.max(0, profile.credit_limit - r.outstanding - r.reserved);
  const reason =
    profile.status === "frozen" ? "frozen" : user.kyc_tier === "tier0" ? "kyc_required" : r.outstanding > 0 && available === 0 ? "repay_first" : "ok";
  return { ...profile, outstanding: r.outstanding, reserved: r.reserved, available, reason };
}

/** Records an overdraft drawdown against the allowance's loan (created on first draw). */
export async function drawCredit(
  tx: Db,
  partner: Partner,
  allowance: { id: Uint8Array; user_id: string | null; currency: string },
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const fee = loanFee(amount, partner.credit_fee_bps);
  await tx`
    insert into pv.loans (partner_id, user_id, allowance_id, currency, principal, fee, due_at)
    values (${partner.id}, ${allowance.user_id}, ${allowance.id}, ${allowance.currency}, ${amount}, ${fee},
            now() + make_interval(days => ${partner.credit_term_days}))
    on conflict (allowance_id) do update set
      principal = pv.loans.principal + excluded.principal,
      fee = pv.loans.fee + excluded.fee,
      status = case when pv.loans.status = 'repaid' then 'open' else pv.loans.status end,
      updated_at = now()`;
  if (partner.ledger_mode === "hosted" && fee > 0) {
    const receivable = await accountId(tx, partner.id, "credit_receivable", allowance.currency);
    const income = await accountId(tx, partner.id, "fee_income", allowance.currency);
    await postJournal(tx, {
      partnerId: partner.id,
      kind: "loan_fee",
      ref: Buffer.from(allowance.id).toString("hex"),
      postings: transfer(receivable, income, fee),
    });
  }
  await emit(tx, partner.id, "loan.drawn", {
    allowanceId: Buffer.from(allowance.id).toString("hex"),
    userId: allowance.user_id,
    currency: allowance.currency,
    amount,
    fee,
  });
}

export type Loan = {
  id: string;
  allowance_id: Uint8Array;
  currency: string;
  principal: number;
  fee: number;
  repaid: number;
  due_at: Date;
  status: "open" | "repaid" | "overdue" | "written_off";
  created_at: Date;
};

export async function loansForUser(tx: Db, userId: string): Promise<Loan[]> {
  return tx<Loan[]>`select id, allowance_id, currency, principal, fee, repaid, due_at, status, created_at
                    from pv.loans where user_id = ${userId} order by created_at desc limit 50`;
}

/**
 * Repays open loans (oldest first) from the wallet. With no amount, repays as
 * much as the wallet allows. Returns the amount repaid.
 */
export async function repayFromWallet(tx: Db, userId: string, maxAmount?: number): Promise<number> {
  const user = await userById(tx, userId);
  if (!user) throw new Error("User not found");
  const loans = await tx<Loan[]>`
    select * from pv.loans where user_id = ${userId} and status in ('open', 'overdue')
    order by due_at for update`;
  if (!loans.length) return 0;
  const wallet = await accountId(tx, user.partner_id, "wallet", user.currency, userId);
  let budget = Math.min(await balanceOf(tx, wallet, true), maxAmount ?? Number.MAX_SAFE_INTEGER);
  let total = 0;
  for (const loan of loans) {
    if (budget <= 0) break;
    const pay = Math.min(budget, loan.principal + loan.fee - loan.repaid);
    if (pay <= 0) continue;
    const receivable = await accountId(tx, user.partner_id, "credit_receivable", loan.currency);
    await postJournal(tx, {
      partnerId: user.partner_id,
      kind: "loan_repayment",
      ref: loan.id,
      postings: transfer(wallet, receivable, pay),
    });
    const done = loan.repaid + pay >= loan.principal + loan.fee;
    await tx`update pv.loans set repaid = repaid + ${pay}, status = ${done ? "repaid" : loan.status}, updated_at = now()
             where id = ${loan.id}`;
    if (done) await emit(tx, user.partner_id, "loan.repaid", { loanId: loan.id, userId });
    budget -= pay;
    total += pay;
  }
  return total;
}

/** Marks loans past due as overdue. Run on a schedule. */
export async function markOverdue(tx: Db): Promise<number> {
  const rows = await tx`update pv.loans set status = 'overdue', updated_at = now()
                        where status = 'open' and due_at < now() returning id`;
  return rows.length;
}

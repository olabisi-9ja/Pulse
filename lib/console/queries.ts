import "server-only";
import { db } from "@/lib/server/db";
import type { Money } from "./format";

/** Every query here is scoped to one partner id; callers pass the id from getConsoleContext. */

export const PAGE_SIZE = 25;
export const HEX = /^[0-9a-f]+$/i;

const sql = () => db();

function like(q: string) {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export type Page<T> = { rows: T[]; total: number; page: number; pages: number };

function paged<T>(rows: T[], total: number, page: number): Page<T> {
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const toPage = (v: string | undefined) => Math.max(1, Math.min(10_000, Number.parseInt(v ?? "1", 10) || 1));

/* ------------------------------ Overview ------------------------------ */

export type OverviewData = {
  activeVaults: number;
  totalVaults: number;
  exposure: Money[];
  settled24: { count: number; totals: Money[] };
  settled7: { count: number; totals: Money[] };
  overdraft: Money[];
  openCases: number;
  riskLoss: Money[];
  events: { id: number; type: string; payload: Record<string, unknown>; created_at: Date; delivered_at: Date | null }[];
};

export async function overview(partnerId: string): Promise<OverviewData> {
  const s = sql();
  const [vaults, exposure, s24, s7, overdraft, cases, loss, events] = await Promise.all([
    s<{ active: number; total: number }[]>`
      select count(*) filter (where status = 'active')::int as active, count(*)::int as total
      from pv.allowances where partner_id = ${partnerId}`,
    s<Money[]>`
      select currency, sum(greatest(0, funded + credit - settled_funded - settled_credit))::bigint as amount
      from pv.allowances where partner_id = ${partnerId} and status = 'active' group by currency order by currency`,
    s<{ currency: string; amount: number; n: number }[]>`
      select currency, sum(p.amount)::bigint as amount, count(*)::int as n
      from pv.payments p join pv.allowances a on a.id = p.allowance_id
      where p.partner_id = ${partnerId} and p.status = 'settled' and p.received_at >= now() - interval '24 hours'
      group by currency order by currency`,
    s<{ currency: string; amount: number; n: number }[]>`
      select currency, sum(p.amount)::bigint as amount, count(*)::int as n
      from pv.payments p join pv.allowances a on a.id = p.allowance_id
      where p.partner_id = ${partnerId} and p.status = 'settled' and p.received_at >= now() - interval '7 days'
      group by currency order by currency`,
    s<Money[]>`
      select currency, sum(principal + fee - repaid)::bigint as amount from pv.loans
      where partner_id = ${partnerId} and status in ('open', 'overdue') group by currency order by currency`,
    s<{ n: number }[]>`select count(*)::int as n from pv.fraud_cases where partner_id = ${partnerId} and status = 'open'`,
    s<Money[]>`
      select a.currency, sum(p.from_risk_pool)::bigint as amount
      from pv.payments p join pv.allowances a on a.id = p.allowance_id
      where p.partner_id = ${partnerId} group by a.currency having sum(p.from_risk_pool) > 0 order by a.currency`,
    s<OverviewData["events"]>`
      select id, type, payload, created_at, delivered_at from pv.events
      where partner_id = ${partnerId} order by id desc limit 10`,
  ]);
  const fold = (rows: { currency: string; amount: number; n: number }[]) => ({
    count: rows.reduce((a, r) => a + r.n, 0),
    totals: rows.map((r) => ({ currency: r.currency, amount: r.amount })),
  });
  return {
    activeVaults: vaults[0].active,
    totalVaults: vaults[0].total,
    exposure: exposure.filter((m) => m.amount > 0),
    settled24: fold(s24),
    settled7: fold(s7),
    overdraft: overdraft.filter((m) => m.amount > 0),
    openCases: cases[0].n,
    riskLoss: loss,
    events,
  };
}

/* ------------------------------ Metrics ------------------------------ */

export type MetricsData = {
  days: number;
  payments: number;
  via: Record<string, number>;
  settle: { median: number | null; p90: number | null; n: number };
  cases: { total: number; forks: number };
  loss: { currency: string; loss: number; volume: number }[];
  drawn: Money[];
  due: { due: number; repaid: number };
  gaps: { allowances: number; payments: number };
};

export async function metrics(partnerId: string, days: number): Promise<MetricsData> {
  const s = sql();
  const [via, settle, cases, loss, drawn, due, gaps] = await Promise.all([
    s<{ received_via: string; n: number }[]>`
      select received_via, count(*)::int as n from pv.payments
      where partner_id = ${partnerId} and received_at >= now() - make_interval(days => ${days}) group by 1`,
    s<{ median: number | null; p90: number | null; n: number }[]>`
      select percentile_cont(0.5) within group (order by secs) as median,
             percentile_cont(0.9) within group (order by secs) as p90, count(*)::int as n
      from (select extract(epoch from received_at - device_time) as secs from pv.payments
            where partner_id = ${partnerId} and received_at >= now() - make_interval(days => ${days})) x
      where secs >= 0`,
    s<{ total: number; forks: number }[]>`
      select count(*)::int as total, count(*) filter (where kind = 'fork')::int as forks from pv.fraud_cases
      where partner_id = ${partnerId} and created_at >= now() - make_interval(days => ${days})`,
    s<{ currency: string; loss: number; volume: number }[]>`
      select a.currency, coalesce(sum(p.from_risk_pool), 0)::bigint as loss, coalesce(sum(p.amount), 0)::bigint as volume
      from pv.payments p join pv.allowances a on a.id = p.allowance_id
      where p.partner_id = ${partnerId} and p.received_at >= now() - make_interval(days => ${days})
      group by a.currency order by a.currency`,
    s<Money[]>`
      select currency, sum(principal)::bigint as amount from pv.loans
      where partner_id = ${partnerId} and created_at >= now() - make_interval(days => ${days}) group by currency order by currency`,
    s<{ due: number; repaid: number }[]>`
      select count(*)::int as due,
             count(*) filter (where status = 'repaid' and updated_at <= due_at)::int as repaid
      from pv.loans
      where partner_id = ${partnerId} and due_at <= now() and due_at >= now() - make_interval(days => ${days})`,
    s<{ allowances: number; payments: number }[]>`
      with w as (
        select allowance_id, count(*)::int as n, max(seq) as max_seq from pv.payments
        where partner_id = ${partnerId} and received_at >= now() - make_interval(days => ${days})
        group by allowance_id)
      select count(*)::int as allowances, coalesce(sum(w.n), 0)::int as payments
      from w join pv.allowances a on a.id = w.allowance_id
      where a.payments_count < (select max(seq) from pv.payments where allowance_id = a.id)`,
  ]);
  const viaMap: Record<string, number> = {};
  for (const r of via) viaMap[r.received_via] = r.n;
  return {
    days,
    payments: via.reduce((a, r) => a + r.n, 0),
    via: viaMap,
    settle: settle[0],
    cases: cases[0],
    loss,
    drawn,
    due: due[0],
    gaps: gaps[0],
  };
}

/* ----------------------------- Allowances ----------------------------- */

export type AllowanceListRow = {
  id: string;
  external_ref: string | null;
  holder: string | null;
  currency: string;
  country: string;
  funded: number;
  credit: number;
  settled_funded: number;
  settled_credit: number;
  payments_count: number;
  expires_at: Date;
  status: string;
};

export async function listAllowances(
  partnerId: string,
  f: { status?: string; country?: string; q?: string; page: number },
): Promise<Page<AllowanceListRow>> {
  const s = sql();
  const q = f.q?.trim();
  const where = s`a.partner_id = ${partnerId}
    ${f.status ? s`and a.status = ${f.status}` : s``}
    ${f.country ? s`and a.country = ${f.country}` : s``}
    ${q ? s`and (encode(a.id, 'hex') like ${like(q.toLowerCase())} escape '\\' or a.external_ref ilike ${like(q)} escape '\\')` : s``}`;
  const [{ n }] = await s<{ n: number }[]>`select count(*)::int as n from pv.allowances a where ${where}`;
  const rows = await s<AllowanceListRow[]>`
    select encode(a.id, 'hex') as id, a.external_ref, coalesce(nullif(u.display_name, ''), u.email) as holder,
           a.currency, a.country, a.funded, a.credit, a.settled_funded, a.settled_credit, a.payments_count,
           a.expires_at, a.status
    from pv.allowances a left join pv.users u on u.id = a.user_id
    where ${where} order by a.created_at desc limit ${PAGE_SIZE} offset ${(f.page - 1) * PAGE_SIZE}`;
  return paged(rows, n, f.page);
}

export async function allowanceCountries(partnerId: string): Promise<string[]> {
  const rows = await sql()<{ country: string }[]>`
    select distinct country from pv.allowances where partner_id = ${partnerId} order by country`;
  return rows.map((r) => r.country);
}

export type AllowanceDetail = {
  id: string;
  external_ref: string | null;
  holder: string | null;
  device_public_key: string;
  issuer_kid: number;
  country: string;
  currency: string;
  funded: number;
  credit: number;
  per_tx_limit: number;
  max_payments: number;
  issued_at: Date;
  expires_at: Date;
  status: string;
  settled_funded: number;
  settled_credit: number;
  settled_loss: number;
  payments_count: number;
  declared_seq: number | null;
  declared_cumulative: number | null;
  refunded: number;
  closed_at: Date | null;
};

export type ChainRow = {
  id: string;
  seq: number;
  amount: number;
  cumulative: number;
  from_funded: number;
  from_credit: number;
  from_risk_pool: number;
  received_via: string;
  device_time: Date;
  received_at: Date;
  status: string;
};

export type FraudRow = {
  id: string;
  allowance_id: string;
  currency: string;
  kind: string;
  seq: number | null;
  payment_ids: string[];
  loss: number;
  status: string;
  created_at: Date;
};

export async function allowanceDetail(partnerId: string, idHex: string) {
  if (!/^[0-9a-f]{32}$/i.test(idHex)) return null;
  const s = sql();
  const [a] = await s<AllowanceDetail[]>`
    select encode(a.id, 'hex') as id, a.external_ref, coalesce(nullif(u.display_name, ''), u.email) as holder,
           encode(a.device_public_key, 'hex') as device_public_key, a.issuer_kid, a.country, a.currency, a.funded,
           a.credit, a.per_tx_limit, a.max_payments, a.issued_at, a.expires_at, a.status, a.settled_funded,
           a.settled_credit, a.settled_loss, a.payments_count, a.declared_seq, a.declared_cumulative, a.refunded,
           a.closed_at
    from pv.allowances a left join pv.users u on u.id = a.user_id
    where a.partner_id = ${partnerId} and a.id = decode(${idHex.toLowerCase()}, 'hex')`;
  if (!a) return null;
  const [chain, fraud] = await Promise.all([
    s<ChainRow[]>`
      select encode(id, 'hex') as id, seq, amount, cumulative, from_funded, from_credit, from_risk_pool,
             received_via, device_time, received_at, status
      from pv.payments where partner_id = ${partnerId} and allowance_id = decode(${idHex.toLowerCase()}, 'hex')
      order by seq, received_at limit 500`,
    fraudQuery(partnerId, { allowanceHex: idHex.toLowerCase() }),
  ]);
  return { allowance: a, chain, fraud };
}

/* ------------------------------ Payments ------------------------------ */

export type PaymentRow = {
  id: string;
  allowance_id: string;
  seq: number;
  amount: number;
  currency: string;
  from_funded: number;
  from_credit: number;
  from_risk_pool: number;
  received_via: string;
  device_time: Date;
  received_at: Date;
  status: string;
};

export async function listPayments(
  partnerId: string,
  f: { status?: string; via?: string; page: number },
): Promise<Page<PaymentRow>> {
  const s = sql();
  const where = s`p.partner_id = ${partnerId}
    ${f.status ? s`and p.status = ${f.status}` : s``}
    ${f.via ? s`and p.received_via = ${f.via}` : s``}`;
  const [{ n }] = await s<{ n: number }[]>`select count(*)::int as n from pv.payments p where ${where}`;
  const rows = await s<PaymentRow[]>`
    select encode(p.id, 'hex') as id, encode(p.allowance_id, 'hex') as allowance_id, p.seq, p.amount, a.currency,
           p.from_funded, p.from_credit, p.from_risk_pool, p.received_via, p.device_time, p.received_at, p.status
    from pv.payments p join pv.allowances a on a.id = p.allowance_id
    where ${where} order by p.received_at desc, p.seq desc limit ${PAGE_SIZE} offset ${(f.page - 1) * PAGE_SIZE}`;
  return paged(rows, n, f.page);
}

/* -------------------------------- Risk -------------------------------- */

async function fraudQuery(partnerId: string, f: { allowanceHex?: string; status?: string; limit?: number }) {
  const s = sql();
  return s<FraudRow[]>`
    select c.id::text as id, encode(c.allowance_id, 'hex') as allowance_id,
           a.currency, c.kind, c.seq,
           coalesce((select array_agg(encode(x, 'hex')) from unnest(c.payment_ids) x), '{}') as payment_ids,
           c.loss, c.status, c.created_at
    from pv.fraud_cases c join pv.allowances a on a.id = c.allowance_id
    where c.partner_id = ${partnerId}
      ${f.allowanceHex ? s`and c.allowance_id = decode(${f.allowanceHex}, 'hex')` : s``}
      ${f.status ? s`and c.status = ${f.status}` : s``}
    order by c.created_at desc limit ${f.limit ?? 200}`;
}

export async function listFraud(partnerId: string) {
  const rows = await fraudQuery(partnerId, {});
  const open = rows.filter((r) => r.status === "open").length;
  const loss = new Map<string, number>();
  for (const r of rows) loss.set(r.currency, (loss.get(r.currency) ?? 0) + r.loss);
  return {
    rows,
    open,
    loss: [...loss].filter(([, v]) => v > 0).map(([currency, amount]) => ({ currency, amount })),
  };
}

/* -------------------------------- Credit ------------------------------- */

export type LoanRow = {
  id: string;
  allowance_id: string;
  holder: string | null;
  currency: string;
  principal: number;
  fee: number;
  repaid: number;
  due_at: Date;
  status: string;
};

export async function creditData(partnerId: string, status: string | undefined, page: number) {
  const s = sql();
  const where = s`l.partner_id = ${partnerId} ${status ? s`and l.status = ${status}` : s``}`;
  const [{ n }] = await s<{ n: number }[]>`select count(*)::int as n from pv.loans l where ${where}`;
  const [rows, totals, partner] = await Promise.all([
    s<LoanRow[]>`
      select l.id::text as id, encode(l.allowance_id, 'hex') as allowance_id,
             coalesce(nullif(u.display_name, ''), u.email) as holder, l.currency, l.principal, l.fee, l.repaid,
             l.due_at, l.status
      from pv.loans l left join pv.users u on u.id = l.user_id
      where ${where} order by l.created_at desc limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`,
    s<{ currency: string; principal: number; fee: number; repaid: number; outstanding: number }[]>`
      select currency, sum(principal)::bigint as principal, sum(fee)::bigint as fee, sum(repaid)::bigint as repaid,
             coalesce(sum(principal + fee - repaid) filter (where status in ('open', 'overdue')), 0)::bigint as outstanding
      from pv.loans where partner_id = ${partnerId} group by currency order by currency`,
    s<{ credit_fee_bps: number; credit_term_days: number }[]>`
      select credit_fee_bps, credit_term_days from pv.partners where id = ${partnerId}`,
  ]);
  return { loans: paged(rows, n, page), totals, policy: partner[0] };
}

/* -------------------------------- Users -------------------------------- */

export type UserRow = {
  id: string;
  email: string;
  display_name: string;
  country: string;
  kyc_tier: string;
  merchant_name: string | null;
  is_merchant: boolean;
  status: string;
  created_at: Date;
};

export async function listUsers(partnerId: string, f: { q?: string; page: number }): Promise<Page<UserRow>> {
  const s = sql();
  const q = f.q?.trim();
  const where = s`u.partner_id = ${partnerId}
    ${q ? s`and (u.email ilike ${like(q)} escape '\\' or u.display_name ilike ${like(q)} escape '\\')` : s``}`;
  const [{ n }] = await s<{ n: number }[]>`select count(*)::int as n from pv.users u where ${where}`;
  const rows = await s<UserRow[]>`
    select u.id::text as id, u.email, u.display_name, u.country, u.kyc_tier, u.merchant_name,
           (u.merchant_id is not null) as is_merchant, u.status, u.created_at
    from pv.users u where ${where} order by u.created_at desc limit ${PAGE_SIZE} offset ${(f.page - 1) * PAGE_SIZE}`;
  return paged(rows, n, f.page);
}

/* ------------------------------ Developers ----------------------------- */

export async function developersData(partnerId: string) {
  const s = sql();
  const [keys, issuers, partner, events] = await Promise.all([
    s<{ id: string; name: string; prefix: string; created_at: Date; last_used_at: Date | null; revoked_at: Date | null }[]>`
      select id::text as id, name, prefix, created_at, last_used_at, revoked_at from pv.api_keys
      where partner_id = ${partnerId} order by created_at desc limit 100`,
    s<{ kid: number; status: string; created_at: Date; retired_at: Date | null }[]>`
      select kid, status, created_at, retired_at from pv.issuer_keys where partner_id = ${partnerId} order by kid desc`,
    s<{ webhook_url: string | null; has_secret: boolean }[]>`
      select webhook_url, (webhook_secret is not null) as has_secret from pv.partners where id = ${partnerId}`,
    s<{ id: number; type: string; created_at: Date; delivered_at: Date | null; attempts: number; last_error: string | null }[]>`
      select id, type, created_at, delivered_at, attempts, last_error from pv.events
      where partner_id = ${partnerId} order by id desc limit 20`,
  ]);
  return { keys, issuers, webhook: partner[0], events };
}

/* ------------------------------- Settings ------------------------------ */

export async function settingsData(partnerId: string) {
  const s = sql();
  const [partner, members, payments] = await Promise.all([
    s<{ id: string; slug: string; name: string; kind: string; countries: string[]; ledger_mode: string }[]>`
      select id::text as id, slug, name, kind, countries, ledger_mode from pv.partners where id = ${partnerId}`,
    s<{ user_id: string; role: string; created_at: Date; email: string | null; display_name: string | null }[]>`
      select m.user_id::text as user_id, m.role, m.created_at, u.email, u.display_name
      from pv.partner_members m left join pv.users u on u.id = m.user_id
      where m.partner_id = ${partnerId} order by m.created_at`,
    s<{ n: number }[]>`select count(*)::int as n from pv.payments where partner_id = ${partnerId}`,
  ]);
  return { partner: partner[0], members, hasPayments: payments[0].n > 0 };
}

-- PayVault core schema.
-- Lives in its own schema ("pv"), which Supabase's REST API does not expose.
-- All access goes through the PayVault server with a direct Postgres connection.

create schema if not exists pv;

-- Partners (tenants): banks, mobile money operators, fintechs, NGOs.
create table pv.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text not null check (kind in ('bank', 'mmo', 'fintech', 'psp', 'ngo', 'sandbox')),
  countries text[] not null default '{}',
  ledger_mode text not null default 'hosted' check (ledger_mode in ('hosted', 'external')),
  webhook_url text,
  webhook_secret text,
  -- Credit policy for offline overdraft.
  credit_fee_bps int not null default 200 check (credit_fee_bps between 0 and 5000),
  credit_term_days int not null default 14 check (credit_term_days between 1 and 90),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create table pv.users (
  id uuid primary key, -- Supabase auth user id
  email text not null,
  partner_id uuid not null references pv.partners(id),
  display_name text not null default '',
  country text not null,
  currency text not null,
  locale text not null default 'en' check (locale in ('en', 'fr')),
  kyc_tier text not null default 'tier0' check (kyc_tier in ('tier0', 'tier1', 'tier2')),
  merchant_id bytea unique check (merchant_id is null or length(merchant_id) = 8),
  merchant_name text,
  status text not null default 'active' check (status in ('active', 'frozen')),
  created_at timestamptz not null default now()
);
create index on pv.users (partner_id);

create table pv.partner_members (
  partner_id uuid not null references pv.partners(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'admin', 'analyst')),
  created_at timestamptz not null default now(),
  primary key (partner_id, user_id)
);

create table pv.api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references pv.partners(id) on delete cascade,
  name text not null,
  prefix text not null unique,
  secret_hash bytea not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

-- Partner signing keys for allowance certificates. kid is the u32 in certs.
create table pv.issuer_keys (
  kid serial primary key,
  partner_id uuid not null references pv.partners(id),
  public_key bytea not null check (length(public_key) = 33),
  private_key_enc bytea not null,
  status text not null default 'active' check (status in ('active', 'retired', 'revoked')),
  created_at timestamptz not null default now(),
  retired_at timestamptz
);
create unique index issuer_keys_one_active on pv.issuer_keys (partner_id) where status = 'active';

create table pv.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references pv.users(id),
  public_key bytea not null unique check (length(public_key) = 33),
  label text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);
create index on pv.devices (user_id);

-- Double-entry ledger (hosted mode). Postings in a journal sum to zero.
-- Balances are signed: positive = owed to the account holder.
create table pv.accounts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references pv.partners(id),
  user_id uuid references pv.users(id),
  kind text not null check (kind in (
    'wallet', 'vault', 'merchant', 'credit_receivable', 'risk_pool', 'funding', 'fee_income', 'payout'
  )),
  currency text not null,
  balance bigint not null default 0,
  created_at timestamptz not null default now()
);
create unique index accounts_owner on pv.accounts (partner_id, coalesce(user_id, '00000000-0000-0000-0000-000000000000'), kind, currency);

create table pv.journal (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references pv.partners(id),
  kind text not null,
  ref text,
  memo text,
  created_at timestamptz not null default now()
);
create index on pv.journal (partner_id, created_at desc);

create table pv.postings (
  id bigserial primary key,
  journal_id uuid not null references pv.journal(id),
  account_id uuid not null references pv.accounts(id),
  amount bigint not null check (amount <> 0)
);
create index on pv.postings (account_id, id desc);
create index on pv.postings (journal_id);

-- Offline allowances ("vaults").
create table pv.allowances (
  id bytea primary key check (length(id) = 16),
  partner_id uuid not null references pv.partners(id),
  user_id uuid references pv.users(id),
  external_ref text,
  device_id uuid references pv.devices(id),
  device_public_key bytea not null,
  issuer_kid int not null references pv.issuer_keys(kid),
  country text not null,
  currency text not null,
  funded bigint not null,
  credit bigint not null,
  per_tx_limit bigint not null,
  max_payments int not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  cert bytea not null,
  genesis bytea not null,
  status text not null default 'active' check (status in ('active', 'closing', 'closed', 'revoked')),
  -- Settlement progress.
  settled_funded bigint not null default 0,
  settled_credit bigint not null default 0,
  settled_loss bigint not null default 0,
  payments_count int not null default 0,
  -- Signed close statement from the device, if the holder cashed out early.
  declared_seq int,
  declared_cumulative bigint,
  refunded bigint not null default 0,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on pv.allowances (user_id, created_at desc);
create index on pv.allowances (partner_id, status);

create table pv.payments (
  id bytea primary key check (length(id) = 16),
  allowance_id bytea not null references pv.allowances(id),
  partner_id uuid not null references pv.partners(id),
  seq int not null,
  amount bigint not null,
  cumulative bigint not null,
  merchant_id bytea not null,
  merchant_user_id uuid references pv.users(id),
  payer_user_id uuid references pv.users(id),
  nonce bytea not null,
  device_time timestamptz not null,
  encoded bytea not null,
  from_funded bigint not null default 0,
  from_credit bigint not null default 0,
  from_risk_pool bigint not null default 0,
  status text not null check (status in ('settled', 'flagged')),
  journal_id uuid references pv.journal(id),
  received_via text not null check (received_via in ('merchant', 'payer', 'api', 'courier')),
  received_at timestamptz not null default now()
);
create index on pv.payments (allowance_id, seq);
create index on pv.payments (merchant_user_id, received_at desc);
create index on pv.payments (payer_user_id, received_at desc);
create index on pv.payments (partner_id, received_at desc);

create table pv.fraud_cases (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references pv.partners(id),
  allowance_id bytea not null references pv.allowances(id),
  kind text not null check (kind in ('fork', 'chain_break', 'overspend', 'after_close')),
  seq int,
  payment_ids bytea[] not null default '{}',
  loss bigint not null default 0,
  status text not null default 'open' check (status in ('open', 'recovered', 'written_off')),
  created_at timestamptz not null default now(),
  unique (allowance_id, kind, seq)
);

create table pv.revocations (
  allowance_id bytea primary key references pv.allowances(id),
  partner_id uuid not null references pv.partners(id),
  reason text not null,
  created_at timestamptz not null default now()
);
create index on pv.revocations (created_at);

-- Offline overdraft ("pay later").
create table pv.credit_profiles (
  user_id uuid primary key references pv.users(id),
  partner_id uuid not null references pv.partners(id),
  credit_limit bigint not null default 0,
  score int not null default 0,
  status text not null default 'active' check (status in ('active', 'frozen')),
  updated_at timestamptz not null default now()
);

create table pv.loans (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references pv.partners(id),
  user_id uuid references pv.users(id),
  allowance_id bytea not null unique references pv.allowances(id),
  currency text not null,
  principal bigint not null default 0,
  fee bigint not null default 0,
  repaid bigint not null default 0,
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'repaid', 'overdue', 'written_off')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on pv.loans (user_id, status);

-- Outbox for partner webhooks.
create table pv.events (
  id bigserial primary key,
  partner_id uuid not null references pv.partners(id),
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  attempts int not null default 0,
  last_error text
);
create index on pv.events (partner_id, id desc);
create index events_pending on pv.events (id) where delivered_at is null;

-- Lock everything down from Supabase's API roles; only the server connects.
revoke all on schema pv from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema pv from anon, authenticated';
  end if;
end $$;

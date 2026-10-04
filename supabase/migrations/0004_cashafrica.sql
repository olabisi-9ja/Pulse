-- CashTap: online contactless payments from the wallet to a merchant, with a virtual card number per user.
create table pv.cashafrica_pans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references pv.users(id),
  pan text not null unique check (pan ~ '^[0-9]{16}$'),
  expiry text not null check (expiry ~ '^[0-9]{2}/[0-9]{2}$'),
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now()
);
create unique index cashafrica_pans_one_active on pv.cashafrica_pans (user_id) where status = 'active';

create table pv.cashafrica_transactions (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  user_id uuid not null references pv.users(id),
  merchant_user_id uuid not null references pv.users(id),
  amount bigint not null check (amount > 0),
  currency text not null,
  transport text not null check (transport in ('nfc', 'cashscan', 'tap_simulate')),
  status text not null check (status in ('pending', 'completed', 'failed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index on pv.cashafrica_transactions (user_id, created_at desc);
create index on pv.cashafrica_transactions (merchant_user_id, created_at desc);

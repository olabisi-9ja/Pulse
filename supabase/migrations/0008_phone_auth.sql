-- Phone sign-in: a 6-digit code sent by SMS, then a server-side session cookie.
-- Phone-only users have no email.
alter table pv.users alter column email drop not null;

create table pv.login_codes (
  phone text primary key check (phone ~ '^\+[0-9]{8,15}$'),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null
);

create table pv.sessions (
  token_hash text primary key,
  -- The account this phone signed into; it may not be onboarded (no pv.users row) yet.
  user_id uuid not null,
  phone text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index on pv.sessions (user_id);
create index on pv.sessions (expires_at);

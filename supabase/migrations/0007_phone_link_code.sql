-- A phone is linked only after its owner dials USSD from it and enters a one-time code
-- shown in the app (the telco authenticates the caller's number).
alter table pv.users
  add column pending_phone text check (pending_phone is null or pending_phone ~ '^\+[0-9]{8,15}$'),
  add column link_code_hash text,
  add column link_expires timestamptz,
  -- Wrong USSD PINs in a row; at 10 the USSD PIN is wiped and the phone must be re-linked from the app.
  add column ussd_pin_failures int not null default 0;
create index on pv.users (pending_phone) where pending_phone is not null;

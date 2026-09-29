-- Pilot / contact requests from the marketing site.
create table pv.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organisation text not null,
  organisation_type text not null,
  country text,
  monthly_volume text,
  message text,
  locale text,
  created_at timestamptz not null default now()
);
create index on pv.contact_requests (created_at desc);

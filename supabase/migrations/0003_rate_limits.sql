-- Fixed-window request counters. Serverless instances share no memory, so limits live in Postgres.
create table pv.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 1,
  primary key (key, window_start)
);
create index on pv.rate_limits (window_start);

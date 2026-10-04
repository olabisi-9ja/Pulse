-- Last run of in-app scheduled jobs, for hosts without a scheduler.
create table pv.job_runs (
  name text primary key,
  last_run timestamptz not null
);

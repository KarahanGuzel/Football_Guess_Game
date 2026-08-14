-- Allow a cleared week to accept predictions even after the kickoff lock.
alter table public.weeks
  add column if not exists bypass_time_lock boolean not null default false;

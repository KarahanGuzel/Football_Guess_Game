-- Match previews from API-Football (/predictions)
-- Also stores external fixture/team ids for later fixture sync.

alter table public.teams
  add column if not exists api_football_id int unique;

alter table public.matches
  add column if not exists api_football_fixture_id int;

create unique index if not exists matches_api_football_fixture_id_uidx
  on public.matches (api_football_fixture_id)
  where api_football_fixture_id is not null;

create table if not exists public.match_previews (
  match_id uuid primary key references public.matches (id) on delete cascade,
  api_football_fixture_id int not null,
  winner_name text,
  winner_comment text,
  win_or_draw boolean,
  under_over text,
  goals_home text,
  goals_away text,
  advice text,
  percent_home numeric,
  percent_draw numeric,
  percent_away numeric,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists match_previews_fetched_at_idx
  on public.match_previews (fetched_at desc);

-- Same pattern as init.sql: RLS on, no anon/authenticated policies.
-- service_role (server) bypasses RLS.
alter table public.match_previews enable row level security;

-- api_football_id is filled when a fixture is matched during preview sync.

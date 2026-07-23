-- Football Guess Game — initial schema
-- Hobby app: predefined players, weekly predictions, derby/bonus scoring

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.week_status as enum ('draft', 'open', 'locked', 'scored');
create type public.match_status as enum ('scheduled', 'finished');
create type public.predict_result as enum ('home', 'draw', 'away');
create type public.goals_market as enum ('under_25', 'over_25');

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text not null unique,
  is_derby_club boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index teams_derby_club_idx on public.teams (is_derby_club);

-- ---------------------------------------------------------------------------
-- players (predefined users — no registration)
-- ---------------------------------------------------------------------------

create table public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  slug text not null unique,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint players_display_name_not_blank check (length(trim(display_name)) > 0),
  constraint players_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create index players_active_idx on public.players (is_active);

-- ---------------------------------------------------------------------------
-- weeks
-- ---------------------------------------------------------------------------

create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  status public.week_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weeks_label_not_blank check (length(trim(label)) > 0)
);

create index weeks_status_idx on public.weeks (status);
create index weeks_created_at_idx on public.weeks (created_at desc);

-- ---------------------------------------------------------------------------
-- matches
-- ---------------------------------------------------------------------------

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  kickoff_at timestamptz not null,
  is_bonus boolean not null default false,
  is_derby boolean not null default false,
  home_goals int,
  away_goals int,
  status public.match_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint matches_different_teams check (home_team_id <> away_team_id),
  constraint matches_bonus_not_derby check (not (is_bonus and is_derby)),
  constraint matches_goals_non_negative check (
    (home_goals is null and away_goals is null)
    or (home_goals is not null and away_goals is not null and home_goals >= 0 and away_goals >= 0)
  ),
  constraint matches_finished_has_scores check (
    status <> 'finished'
    or (home_goals is not null and away_goals is not null)
  )
);

create index matches_week_id_idx on public.matches (week_id);
create index matches_kickoff_at_idx on public.matches (kickoff_at);
create index matches_home_team_id_idx on public.matches (home_team_id);
create index matches_away_team_id_idx on public.matches (away_team_id);

-- At most one bonus match per week
create unique index matches_one_bonus_per_week_idx
  on public.matches (week_id)
  where is_bonus;

-- ---------------------------------------------------------------------------
-- predictions
-- ---------------------------------------------------------------------------

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  result public.predict_result not null,
  goals_market public.goals_market not null,
  result_correct boolean,
  goals_correct boolean,
  points_earned int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint predictions_player_match_unique unique (player_id, match_id),
  constraint predictions_points_non_negative check (
    points_earned is null or points_earned >= 0
  )
);

create index predictions_player_id_idx on public.predictions (player_id);
create index predictions_match_id_idx on public.predictions (match_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weeks_set_updated_at
  before update on public.weeks
  for each row execute function public.set_updated_at();

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

create trigger predictions_set_updated_at
  before update on public.predictions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-detect derby from team flags (keeps is_derby consistent)
-- ---------------------------------------------------------------------------

create or replace function public.matches_set_derby_flag()
returns trigger
language plpgsql
as $$
declare
  home_derby boolean;
  away_derby boolean;
begin
  select t.is_derby_club into home_derby from public.teams t where t.id = new.home_team_id;
  select t.is_derby_club into away_derby from public.teams t where t.id = new.away_team_id;

  new.is_derby := coalesce(home_derby, false) and coalesce(away_derby, false);

  if new.is_bonus and new.is_derby then
    raise exception 'BONUS_DERBY_CONFLICT: bonus match cannot be a derby';
  end if;

  return new;
end;
$$;

create trigger matches_set_derby_before_write
  before insert or update of home_team_id, away_team_id, is_bonus
  on public.matches
  for each row execute function public.matches_set_derby_flag();

-- ---------------------------------------------------------------------------
-- Week lock helper: first kickoff of the week
-- ---------------------------------------------------------------------------

create or replace function public.week_lock_at(p_week_id uuid)
returns timestamptz
language sql
stable
as $$
  select min(m.kickoff_at)
  from public.matches m
  where m.week_id = p_week_id;
$$;

create or replace function public.is_week_locked(p_week_id uuid)
returns boolean
language sql
stable
as $$
  select
    exists (
      select 1
      from public.weeks w
      where w.id = p_week_id
        and w.status in ('locked', 'scored')
    )
    or (
      public.week_lock_at(p_week_id) is not null
      and now() >= public.week_lock_at(p_week_id)
    );
$$;

-- ---------------------------------------------------------------------------
-- Scoring helpers (usable from SQL or mirrored in TypeScript)
-- ---------------------------------------------------------------------------

create or replace function public.actual_result(home_goals int, away_goals int)
returns public.predict_result
language sql
immutable
as $$
  select case
    when home_goals > away_goals then 'home'::public.predict_result
    when home_goals < away_goals then 'away'::public.predict_result
    else 'draw'::public.predict_result
  end;
$$;

create or replace function public.actual_goals_market(home_goals int, away_goals int)
returns public.goals_market
language sql
immutable
as $$
  select case
    when (home_goals + away_goals) > 2.5 then 'over_25'::public.goals_market
    else 'under_25'::public.goals_market
  end;
$$;

create or replace function public.score_prediction(
  p_result public.predict_result,
  p_goals public.goals_market,
  p_home_goals int,
  p_away_goals int,
  p_is_bonus boolean,
  p_is_derby boolean
)
returns table (
  result_correct boolean,
  goals_correct boolean,
  points_earned int
)
language plpgsql
immutable
as $$
declare
  v_result_ok boolean;
  v_goals_ok boolean;
  v_points int := 0;
begin
  v_result_ok := p_result = public.actual_result(p_home_goals, p_away_goals);
  v_goals_ok := p_goals = public.actual_goals_market(p_home_goals, p_away_goals);

  if p_is_bonus then
    v_points := case when v_result_ok and v_goals_ok then 6 else 0 end;
  else
    if v_result_ok and v_goals_ok then
      v_points := 4;
    elsif v_result_ok then
      v_points := 2;
    elsif v_goals_ok then
      v_points := 1;
    else
      v_points := 0;
    end if;

    if p_is_derby then
      v_points := v_points * 2;
    end if;
  end if;

  result_correct := v_result_ok;
  goals_correct := v_goals_ok;
  points_earned := v_points;
  return next;
end;
$$;

-- Calculate / recalculate all predictions for a week; mark week scored
create or replace function public.calculate_week_points(p_week_id uuid)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.matches m
    where m.week_id = p_week_id
      and (m.home_goals is null or m.away_goals is null)
  ) then
    raise exception 'SCORES_INCOMPLETE: all matches must have final scores';
  end if;

  update public.predictions pr
  set
    result_correct = s.result_correct,
    goals_correct = s.goals_correct,
    points_earned = s.points_earned,
    updated_at = now()
  from public.matches m
  cross join lateral public.score_prediction(
    pr.result,
    pr.goals_market,
    m.home_goals,
    m.away_goals,
    m.is_bonus,
    m.is_derby
  ) s
  where pr.match_id = m.id
    and m.week_id = p_week_id;

  update public.matches
  set status = 'finished',
      updated_at = now()
  where week_id = p_week_id;

  update public.weeks
  set status = 'scored',
      updated_at = now()
  where id = p_week_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Standings view
-- ---------------------------------------------------------------------------

create or replace view public.standings
with (security_invoker = true)
as
select
  p.id as player_id,
  p.display_name,
  p.slug,
  coalesce(sum(pr.points_earned), 0)::int as total_points,
  count(pr.id) filter (where pr.result_correct)::int as correct_result_count,
  count(pr.id) filter (where pr.goals_correct)::int as correct_goals_count,
  count(pr.id) filter (
    where pr.result_correct and pr.goals_correct
  )::int as perfect_prediction_count,
  count(pr.id) filter (where pr.points_earned is not null)::int as scored_prediction_count,
  case
    when count(pr.id) filter (where pr.points_earned is not null) = 0 then 0::numeric
    else round(
      100.0
      * count(pr.id) filter (where pr.result_correct and pr.goals_correct)
      / nullif(count(pr.id) filter (where pr.points_earned is not null), 0),
      1
    )
  end as success_percentage
from public.players p
left join public.predictions pr
  on pr.player_id = p.id
 and pr.points_earned is not null
where p.is_active
group by p.id, p.display_name, p.slug;

-- ---------------------------------------------------------------------------
-- RLS: enabled, no anon/authenticated policies.
-- App uses service_role from Next.js server only.
-- ---------------------------------------------------------------------------

alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.weeks enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

revoke all on table public.teams from anon, authenticated;
revoke all on table public.players from anon, authenticated;
revoke all on table public.weeks from anon, authenticated;
revoke all on table public.matches from anon, authenticated;
revoke all on table public.predictions from anon, authenticated;
revoke all on table public.standings from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed: supported Turkish teams
-- ---------------------------------------------------------------------------

insert into public.teams (name, short_name, is_derby_club, sort_order) values
  ('Fenerbahçe', 'FB', true, 1),
  ('Galatasaray', 'GS', true, 2),
  ('Beşiktaş', 'BJK', true, 3),
  ('Trabzonspor', 'TS', true, 4),
  ('Başakşehir', 'BŞK', false, 5),
  ('Göztepe', 'GÖZ', false, 6);

-- ---------------------------------------------------------------------------
-- Seed: group players
-- ---------------------------------------------------------------------------

insert into public.players (display_name, slug, is_admin) values
  ('Karahan', 'karahan', true),
  ('Batuhan', 'batuhan', false),
  ('Buğra', 'bugra', false),
  ('Baran', 'baran', false),
  ('Atınç', 'atinc', false),
  ('Emrah', 'emrah', false),
  ('Kaan', 'kaan', false);

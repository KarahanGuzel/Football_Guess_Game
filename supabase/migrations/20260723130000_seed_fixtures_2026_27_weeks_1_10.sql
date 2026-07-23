-- Seed: 2026-27 weeks 1-10 fixtures
-- Kickoff times default to 19:00 Europe/Istanbul (UTC+3) when not provided.
-- Safe to re-run: deletes existing weeks with these exact labels first.

begin;

-- Opponent / league teams (tracked clubs already exist from init migration)
insert into public.teams (name, short_name, is_derby_club, sort_order) values
  ('Çorum FK', 'ÇOR', false, 20),
  ('Kasımpaşa', 'KAS', false, 21),
  ('Kocaelispor', 'KOC', false, 22),
  ('Erzurumspor', 'ERZ', false, 23),
  ('Corendon Alanyaspor', 'ALA', false, 24),
  ('Gençlerbirliği', 'GEN', false, 25),
  ('Konyaspor', 'KON', false, 26),
  ('Amed Sportif Faaliyetler', 'AMD', false, 27),
  ('Samsunspor', 'SAM', false, 28),
  ('Gaziantep FK', 'GFK', false, 29),
  ('Çaykur Rizespor', 'RIZ', false, 30),
  ('Eyüpspor', 'EYÜ', false, 31)
on conflict (name) do nothing;

-- Re-seed cleanly for these week labels
delete from public.weeks
where label in (
  '2026-27 1. Hafta',
  '2026-27 2. Hafta',
  '2026-27 3. Hafta',
  '2026-27 4. Hafta',
  '2026-27 5. Hafta',
  '2026-27 6. Hafta',
  '2026-27 7. Hafta',
  '2026-27 8. Hafta',
  '2026-27 9. Hafta',
  '2026-27 10. Hafta'
);

create temporary table tmp_fixtures (
  week_label text not null,
  kickoff_at timestamptz not null,
  home_name text not null,
  away_name text not null
) on commit drop;

insert into tmp_fixtures (week_label, kickoff_at, home_name, away_name) values
  -- 1. Hafta
  ('2026-27 1. Hafta', '2026-08-16 19:00:00+03', 'Galatasaray', 'Çorum FK'),
  ('2026-27 1. Hafta', '2026-08-16 19:00:00+03', 'Kasımpaşa', 'Beşiktaş'),
  ('2026-27 1. Hafta', '2026-08-16 19:00:00+03', 'Göztepe', 'Başakşehir'),
  ('2026-27 1. Hafta', '2026-08-16 19:00:00+03', 'Trabzonspor', 'Kocaelispor'),
  ('2026-27 1. Hafta', '2026-08-16 19:00:00+03', 'Fenerbahçe', 'Erzurumspor'),

  -- 2. Hafta
  ('2026-27 2. Hafta', '2026-08-23 19:00:00+03', 'Trabzonspor', 'Başakşehir'),
  ('2026-27 2. Hafta', '2026-08-23 19:00:00+03', 'Corendon Alanyaspor', 'Beşiktaş'),
  ('2026-27 2. Hafta', '2026-08-23 19:00:00+03', 'Göztepe', 'Gençlerbirliği'),
  ('2026-27 2. Hafta', '2026-08-23 19:00:00+03', 'Fenerbahçe', 'Konyaspor'),
  ('2026-27 2. Hafta', '2026-08-23 19:00:00+03', 'Erzurumspor', 'Galatasaray'),

  -- 3. Hafta
  ('2026-27 3. Hafta', '2026-08-30 19:00:00+03', 'Başakşehir', 'Kasımpaşa'),
  ('2026-27 3. Hafta', '2026-08-30 19:00:00+03', 'Amed Sportif Faaliyetler', 'Trabzonspor'),
  ('2026-27 3. Hafta', '2026-08-30 19:00:00+03', 'Galatasaray', 'Göztepe'),
  ('2026-27 3. Hafta', '2026-08-30 19:00:00+03', 'Beşiktaş', 'Çorum FK'),
  ('2026-27 3. Hafta', '2026-08-30 19:00:00+03', 'Samsunspor', 'Fenerbahçe'),

  -- 4. Hafta
  ('2026-27 4. Hafta', '2026-09-06 19:00:00+03', 'Başakşehir', 'Galatasaray'),
  ('2026-27 4. Hafta', '2026-09-06 19:00:00+03', 'Göztepe', 'Gaziantep FK'),
  ('2026-27 4. Hafta', '2026-09-06 19:00:00+03', 'Fenerbahçe', 'Beşiktaş'),
  ('2026-27 4. Hafta', '2026-09-06 19:00:00+03', 'Trabzonspor', 'Gençlerbirliği'),

  -- 5. Hafta
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Corendon Alanyaspor', 'Göztepe'),
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Amed Sportif Faaliyetler', 'Başakşehir'),
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Konyaspor', 'Trabzonspor'),
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Galatasaray', 'Kocaelispor'),
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Beşiktaş', 'Erzurumspor'),
  ('2026-27 5. Hafta', '2026-09-13 19:00:00+03', 'Gaziantep FK', 'Fenerbahçe'),

  -- 6. Hafta
  ('2026-27 6. Hafta', '2026-09-20 19:00:00+03', 'Trabzonspor', 'Galatasaray'),
  ('2026-27 6. Hafta', '2026-09-20 19:00:00+03', 'Başakşehir', 'Gençlerbirliği'),
  ('2026-27 6. Hafta', '2026-09-20 19:00:00+03', 'Amed Sportif Faaliyetler', 'Beşiktaş'),
  ('2026-27 6. Hafta', '2026-09-20 19:00:00+03', 'Göztepe', 'Çaykur Rizespor'),
  ('2026-27 6. Hafta', '2026-09-20 19:00:00+03', 'Fenerbahçe', 'Eyüpspor'),

  -- 7. Hafta
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Eyüpspor', 'Göztepe'),
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Çaykur Rizespor', 'Fenerbahçe'),
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Konyaspor', 'Başakşehir'),
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Galatasaray', 'Kasımpaşa'),
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Beşiktaş', 'Kocaelispor'),
  ('2026-27 7. Hafta', '2026-10-11 19:00:00+03', 'Samsunspor', 'Trabzonspor'),

  -- 8. Hafta
  ('2026-27 8. Hafta', '2026-10-18 19:00:00+03', 'Trabzonspor', 'Beşiktaş'),
  ('2026-27 8. Hafta', '2026-10-18 19:00:00+03', 'Başakşehir', 'Gaziantep FK'),
  ('2026-27 8. Hafta', '2026-10-18 19:00:00+03', 'Gençlerbirliği', 'Galatasaray'),
  ('2026-27 8. Hafta', '2026-10-18 19:00:00+03', 'Fenerbahçe', 'Corendon Alanyaspor'),
  ('2026-27 8. Hafta', '2026-10-18 19:00:00+03', 'Kocaelispor', 'Göztepe'),

  -- 9. Hafta
  ('2026-27 9. Hafta', '2026-10-25 19:00:00+03', 'Çaykur Rizespor', 'Trabzonspor'),
  ('2026-27 9. Hafta', '2026-10-25 19:00:00+03', 'Göztepe', 'Çorum FK'),
  ('2026-27 9. Hafta', '2026-10-25 19:00:00+03', 'Galatasaray', 'Fenerbahçe'),
  ('2026-27 9. Hafta', '2026-10-25 19:00:00+03', 'Beşiktaş', 'Başakşehir'),

  -- 10. Hafta
  ('2026-27 10. Hafta', '2026-11-01 19:00:00+03', 'Trabzonspor', 'Gaziantep FK'),
  ('2026-27 10. Hafta', '2026-11-01 19:00:00+03', 'Kasımpaşa', 'Beşiktaş'),
  ('2026-27 10. Hafta', '2026-11-01 19:00:00+03', 'Başakşehir', 'Samsunspor'),
  ('2026-27 10. Hafta', '2026-11-01 19:00:00+03', 'Konyaspor', 'Galatasaray'),
  ('2026-27 10. Hafta', '2026-11-01 19:00:00+03', 'Fenerbahçe', 'Göztepe');

-- Create weeks in order
insert into public.weeks (label, status)
select week_label, 'draft'
from (
  select distinct week_label
  from tmp_fixtures
) d
order by week_label;

-- Insert matches (derby flag auto-set by trigger)
insert into public.matches (week_id, home_team_id, away_team_id, kickoff_at)
select
  w.id,
  home.id,
  away.id,
  f.kickoff_at
from tmp_fixtures f
join public.weeks w on w.label = f.week_label
join public.teams home on home.name = f.home_name
join public.teams away on away.name = f.away_name
order by f.kickoff_at, f.home_name;

-- Sanity check: fail if any fixture team name did not resolve
do $$
declare
  missing_count int;
begin
  select count(*) into missing_count
  from tmp_fixtures f
  where not exists (select 1 from public.teams t where t.name = f.home_name)
     or not exists (select 1 from public.teams t where t.name = f.away_name);

  if missing_count > 0 then
    raise exception 'FIXTURE_TEAM_MISSING: % unresolved team name(s)', missing_count;
  end if;
end $$;

commit;

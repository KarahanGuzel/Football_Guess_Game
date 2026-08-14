-- Seed: Süper Lig weeks 1-10 fixtures (2026-27 season calendar)
-- Kickoff times default to 19:00 Europe/Istanbul (UTC+3) when not provided.
-- Safe to re-run: deletes existing weeks with these exact labels first.
-- Labels use competition prefix so UCL weeks can coexist (e.g. Şampiyonlar Ligi 1.Hafta).

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

-- Re-seed cleanly for these week labels (legacy + current naming)
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
  '2026-27 10. Hafta',
  'SüperLig 1.Hafta',
  'SüperLig 2.Hafta',
  'SüperLig 3.Hafta',
  'SüperLig 4.Hafta',
  'SüperLig 5.Hafta',
  'SüperLig 6.Hafta',
  'SüperLig 7.Hafta',
  'SüperLig 8.Hafta',
  'SüperLig 9.Hafta',
  'SüperLig 10.Hafta'
);

create temporary table tmp_fixtures (
  week_label text not null,
  kickoff_at timestamptz not null,
  home_name text not null,
  away_name text not null
) on commit drop;

insert into tmp_fixtures (week_label, kickoff_at, home_name, away_name) values
  -- 1. Hafta
  ('SüperLig 1.Hafta', '2026-08-14 21:30:00+03', 'Galatasaray', 'Çorum FK'),
  ('SüperLig 1.Hafta', '2026-08-16 19:00:00+03', 'Eyüpspor', 'Beşiktaş'),
  ('SüperLig 1.Hafta', '2026-08-16 19:00:00+03', 'Göztepe', 'Başakşehir'),
  ('SüperLig 1.Hafta', '2026-08-16 19:00:00+03', 'Trabzonspor', 'Kocaelispor'),
  ('SüperLig 1.Hafta', '2026-08-16 19:00:00+03', 'Gençlerbirliği', 'Fenerbahçe'),

  -- 2. Hafta
  ('SüperLig 2.Hafta', '2026-08-23 19:00:00+03', 'Trabzonspor', 'Başakşehir'),
  ('SüperLig 2.Hafta', '2026-08-23 19:00:00+03', 'Corendon Alanyaspor', 'Beşiktaş'),
  ('SüperLig 2.Hafta', '2026-08-23 19:00:00+03', 'Göztepe', 'Gençlerbirliği'),
  ('SüperLig 2.Hafta', '2026-08-23 19:00:00+03', 'Fenerbahçe', 'Konyaspor'),
  ('SüperLig 2.Hafta', '2026-08-23 19:00:00+03', 'Erzurumspor', 'Galatasaray'),

  -- 3. Hafta
  ('SüperLig 3.Hafta', '2026-08-30 19:00:00+03', 'Başakşehir', 'Kasımpaşa'),
  ('SüperLig 3.Hafta', '2026-08-30 19:00:00+03', 'Amed Sportif Faaliyetler', 'Trabzonspor'),
  ('SüperLig 3.Hafta', '2026-08-30 19:00:00+03', 'Galatasaray', 'Göztepe'),
  ('SüperLig 3.Hafta', '2026-08-30 19:00:00+03', 'Beşiktaş', 'Çorum FK'),
  ('SüperLig 3.Hafta', '2026-08-30 19:00:00+03', 'Samsunspor', 'Fenerbahçe'),

  -- 4. Hafta
  ('SüperLig 4.Hafta', '2026-09-06 19:00:00+03', 'Başakşehir', 'Galatasaray'),
  ('SüperLig 4.Hafta', '2026-09-06 19:00:00+03', 'Göztepe', 'Gaziantep FK'),
  ('SüperLig 4.Hafta', '2026-09-06 19:00:00+03', 'Fenerbahçe', 'Beşiktaş'),
  ('SüperLig 4.Hafta', '2026-09-06 19:00:00+03', 'Trabzonspor', 'Gençlerbirliği'),

  -- 5. Hafta
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Corendon Alanyaspor', 'Göztepe'),
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Amed Sportif Faaliyetler', 'Başakşehir'),
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Konyaspor', 'Trabzonspor'),
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Galatasaray', 'Kocaelispor'),
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Beşiktaş', 'Erzurumspor'),
  ('SüperLig 5.Hafta', '2026-09-13 19:00:00+03', 'Gaziantep FK', 'Fenerbahçe'),

  -- 6. Hafta
  ('SüperLig 6.Hafta', '2026-09-20 19:00:00+03', 'Trabzonspor', 'Galatasaray'),
  ('SüperLig 6.Hafta', '2026-09-20 19:00:00+03', 'Başakşehir', 'Gençlerbirliği'),
  ('SüperLig 6.Hafta', '2026-09-20 19:00:00+03', 'Amed Sportif Faaliyetler', 'Beşiktaş'),
  ('SüperLig 6.Hafta', '2026-09-20 19:00:00+03', 'Göztepe', 'Çaykur Rizespor'),
  ('SüperLig 6.Hafta', '2026-09-20 19:00:00+03', 'Fenerbahçe', 'Eyüpspor'),

  -- 7. Hafta
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Eyüpspor', 'Göztepe'),
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Çaykur Rizespor', 'Fenerbahçe'),
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Konyaspor', 'Başakşehir'),
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Galatasaray', 'Kasımpaşa'),
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Beşiktaş', 'Kocaelispor'),
  ('SüperLig 7.Hafta', '2026-10-11 19:00:00+03', 'Samsunspor', 'Trabzonspor'),

  -- 8. Hafta
  ('SüperLig 8.Hafta', '2026-10-18 19:00:00+03', 'Trabzonspor', 'Beşiktaş'),
  ('SüperLig 8.Hafta', '2026-10-18 19:00:00+03', 'Başakşehir', 'Gaziantep FK'),
  ('SüperLig 8.Hafta', '2026-10-18 19:00:00+03', 'Gençlerbirliği', 'Galatasaray'),
  ('SüperLig 8.Hafta', '2026-10-18 19:00:00+03', 'Fenerbahçe', 'Corendon Alanyaspor'),
  ('SüperLig 8.Hafta', '2026-10-18 19:00:00+03', 'Kocaelispor', 'Göztepe'),

  -- 9. Hafta
  ('SüperLig 9.Hafta', '2026-10-25 19:00:00+03', 'Çaykur Rizespor', 'Trabzonspor'),
  ('SüperLig 9.Hafta', '2026-10-25 19:00:00+03', 'Göztepe', 'Çorum FK'),
  ('SüperLig 9.Hafta', '2026-10-25 19:00:00+03', 'Galatasaray', 'Fenerbahçe'),
  ('SüperLig 9.Hafta', '2026-10-25 19:00:00+03', 'Beşiktaş', 'Başakşehir'),

  -- 10. Hafta
  ('SüperLig 10.Hafta', '2026-11-01 19:00:00+03', 'Trabzonspor', 'Gaziantep FK'),
  ('SüperLig 10.Hafta', '2026-11-01 19:00:00+03', 'Kasımpaşa', 'Beşiktaş'),
  ('SüperLig 10.Hafta', '2026-11-01 19:00:00+03', 'Başakşehir', 'Samsunspor'),
  ('SüperLig 10.Hafta', '2026-11-01 19:00:00+03', 'Konyaspor', 'Galatasaray'),
  ('SüperLig 10.Hafta', '2026-11-01 19:00:00+03', 'Fenerbahçe', 'Göztepe');

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

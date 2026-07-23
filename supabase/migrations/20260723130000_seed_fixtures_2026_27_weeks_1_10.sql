-- Seed: 2026-27 weeks 1-10 fixtures
-- Kickoff times default to 19:00 Europe/Istanbul (UTC+3).
-- Safe to re-run: deletes existing weeks with these exact labels first.
-- No temp tables (Supabase SQL Editor compatible).

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

-- Create weeks
insert into public.weeks (label, status) values
  ('2026-27 1. Hafta', 'draft'),
  ('2026-27 2. Hafta', 'draft'),
  ('2026-27 3. Hafta', 'draft'),
  ('2026-27 4. Hafta', 'draft'),
  ('2026-27 5. Hafta', 'draft'),
  ('2026-27 6. Hafta', 'draft'),
  ('2026-27 7. Hafta', 'draft'),
  ('2026-27 8. Hafta', 'draft'),
  ('2026-27 9. Hafta', 'draft'),
  ('2026-27 10. Hafta', 'draft');

-- Insert matches (derby flag auto-set by trigger)
insert into public.matches (week_id, home_team_id, away_team_id, kickoff_at)
select
  w.id,
  home.id,
  away.id,
  v.kickoff_at
from (
  values
    -- 1. Hafta
    ('2026-27 1. Hafta', '2026-08-16 19:00:00+03'::timestamptz, 'Galatasaray', 'Çorum FK'),
    ('2026-27 1. Hafta', '2026-08-16 19:00:00+03'::timestamptz, 'Eyüpspor', 'Beşiktaş'),
    ('2026-27 1. Hafta', '2026-08-16 19:00:00+03'::timestamptz, 'Göztepe', 'Başakşehir'),
    ('2026-27 1. Hafta', '2026-08-16 19:00:00+03'::timestamptz, 'Trabzonspor', 'Kocaelispor'),
    ('2026-27 1. Hafta', '2026-08-16 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Erzurumspor'),

    -- 2. Hafta
    ('2026-27 2. Hafta', '2026-08-23 19:00:00+03'::timestamptz, 'Trabzonspor', 'Başakşehir'),
    ('2026-27 2. Hafta', '2026-08-23 19:00:00+03'::timestamptz, 'Corendon Alanyaspor', 'Beşiktaş'),
    ('2026-27 2. Hafta', '2026-08-23 19:00:00+03'::timestamptz, 'Göztepe', 'Gençlerbirliği'),
    ('2026-27 2. Hafta', '2026-08-23 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Konyaspor'),
    ('2026-27 2. Hafta', '2026-08-23 19:00:00+03'::timestamptz, 'Erzurumspor', 'Galatasaray'),

    -- 3. Hafta
    ('2026-27 3. Hafta', '2026-08-30 19:00:00+03'::timestamptz, 'Başakşehir', 'Kasımpaşa'),
    ('2026-27 3. Hafta', '2026-08-30 19:00:00+03'::timestamptz, 'Amed Sportif Faaliyetler', 'Trabzonspor'),
    ('2026-27 3. Hafta', '2026-08-30 19:00:00+03'::timestamptz, 'Galatasaray', 'Göztepe'),
    ('2026-27 3. Hafta', '2026-08-30 19:00:00+03'::timestamptz, 'Beşiktaş', 'Çorum FK'),
    ('2026-27 3. Hafta', '2026-08-30 19:00:00+03'::timestamptz, 'Samsunspor', 'Fenerbahçe'),

    -- 4. Hafta
    ('2026-27 4. Hafta', '2026-09-06 19:00:00+03'::timestamptz, 'Başakşehir', 'Galatasaray'),
    ('2026-27 4. Hafta', '2026-09-06 19:00:00+03'::timestamptz, 'Göztepe', 'Gaziantep FK'),
    ('2026-27 4. Hafta', '2026-09-06 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Beşiktaş'),
    ('2026-27 4. Hafta', '2026-09-06 19:00:00+03'::timestamptz, 'Trabzonspor', 'Gençlerbirliği'),

    -- 5. Hafta
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Corendon Alanyaspor', 'Göztepe'),
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Amed Sportif Faaliyetler', 'Başakşehir'),
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Konyaspor', 'Trabzonspor'),
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Galatasaray', 'Kocaelispor'),
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Beşiktaş', 'Erzurumspor'),
    ('2026-27 5. Hafta', '2026-09-13 19:00:00+03'::timestamptz, 'Gaziantep FK', 'Fenerbahçe'),

    -- 6. Hafta
    ('2026-27 6. Hafta', '2026-09-20 19:00:00+03'::timestamptz, 'Trabzonspor', 'Galatasaray'),
    ('2026-27 6. Hafta', '2026-09-20 19:00:00+03'::timestamptz, 'Başakşehir', 'Gençlerbirliği'),
    ('2026-27 6. Hafta', '2026-09-20 19:00:00+03'::timestamptz, 'Amed Sportif Faaliyetler', 'Beşiktaş'),
    ('2026-27 6. Hafta', '2026-09-20 19:00:00+03'::timestamptz, 'Göztepe', 'Çaykur Rizespor'),
    ('2026-27 6. Hafta', '2026-09-20 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Eyüpspor'),

    -- 7. Hafta
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Eyüpspor', 'Göztepe'),
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Çaykur Rizespor', 'Fenerbahçe'),
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Konyaspor', 'Başakşehir'),
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Galatasaray', 'Kasımpaşa'),
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Beşiktaş', 'Kocaelispor'),
    ('2026-27 7. Hafta', '2026-10-11 19:00:00+03'::timestamptz, 'Samsunspor', 'Trabzonspor'),

    -- 8. Hafta
    ('2026-27 8. Hafta', '2026-10-18 19:00:00+03'::timestamptz, 'Trabzonspor', 'Beşiktaş'),
    ('2026-27 8. Hafta', '2026-10-18 19:00:00+03'::timestamptz, 'Başakşehir', 'Gaziantep FK'),
    ('2026-27 8. Hafta', '2026-10-18 19:00:00+03'::timestamptz, 'Gençlerbirliği', 'Galatasaray'),
    ('2026-27 8. Hafta', '2026-10-18 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Corendon Alanyaspor'),
    ('2026-27 8. Hafta', '2026-10-18 19:00:00+03'::timestamptz, 'Kocaelispor', 'Göztepe'),

    -- 9. Hafta
    ('2026-27 9. Hafta', '2026-10-25 19:00:00+03'::timestamptz, 'Çaykur Rizespor', 'Trabzonspor'),
    ('2026-27 9. Hafta', '2026-10-25 19:00:00+03'::timestamptz, 'Göztepe', 'Çorum FK'),
    ('2026-27 9. Hafta', '2026-10-25 19:00:00+03'::timestamptz, 'Galatasaray', 'Fenerbahçe'),
    ('2026-27 9. Hafta', '2026-10-25 19:00:00+03'::timestamptz, 'Beşiktaş', 'Başakşehir'),

    -- 10. Hafta
    ('2026-27 10. Hafta', '2026-11-01 19:00:00+03'::timestamptz, 'Trabzonspor', 'Gaziantep FK'),
    ('2026-27 10. Hafta', '2026-11-01 19:00:00+03'::timestamptz, 'Kasımpaşa', 'Beşiktaş'),
    ('2026-27 10. Hafta', '2026-11-01 19:00:00+03'::timestamptz, 'Başakşehir', 'Samsunspor'),
    ('2026-27 10. Hafta', '2026-11-01 19:00:00+03'::timestamptz, 'Konyaspor', 'Galatasaray'),
    ('2026-27 10. Hafta', '2026-11-01 19:00:00+03'::timestamptz, 'Fenerbahçe', 'Göztepe')
) as v(week_label, kickoff_at, home_name, away_name)
join public.weeks w on w.label = v.week_label
join public.teams home on home.name = v.home_name
join public.teams away on away.name = v.away_name;

-- Quick check (optional): should return 10 weeks and 50 matches
-- select label, status from public.weeks where label like '2026-27 %' order by label;
-- select count(*) from public.matches m join public.weeks w on w.id = m.week_id where w.label like '2026-27 %';

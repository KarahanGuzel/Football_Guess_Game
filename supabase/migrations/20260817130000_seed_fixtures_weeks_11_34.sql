-- Seed: Süper Lig weeks 11-34 (2026-27), tracked clubs only, as drafts.
-- Pairings from TFF Trendyol Süper Lig fixture (hafta=N&pageID=198).
-- Kickoff times are not published yet → 19:00 Europe/Istanbul.
-- Does not touch weeks 1-10. Safe to re-run: skips existing week labels / matches.

begin;

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

create temporary table tmp_fixtures_11_34 (
  week_label text not null,
  kickoff_at timestamptz not null,
  home_name text not null,
  away_name text not null
) on commit drop;

insert into tmp_fixtures_11_34 (week_label, kickoff_at, home_name, away_name) values
  -- 11. Hafta
  ('SüperLig 11.Hafta', '2026-11-08 19:00:00+03', 'Beşiktaş', 'Gençlerbirliği'),
  ('SüperLig 11.Hafta', '2026-11-08 19:00:00+03', 'Corendon Alanyaspor', 'Trabzonspor'),
  ('SüperLig 11.Hafta', '2026-11-08 19:00:00+03', 'Çorum FK', 'Fenerbahçe'),
  ('SüperLig 11.Hafta', '2026-11-08 19:00:00+03', 'Galatasaray', 'Amed Sportif Faaliyetler'),
  ('SüperLig 11.Hafta', '2026-11-08 19:00:00+03', 'Göztepe', 'Başakşehir'),

  -- 12. Hafta
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Başakşehir', 'Çorum FK'),
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Erzurumspor', 'Göztepe'),
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Galatasaray', 'Samsunspor'),
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Kocaelispor', 'Fenerbahçe'),
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Konyaspor', 'Beşiktaş'),
  ('SüperLig 12.Hafta', '2026-11-22 19:00:00+03', 'Trabzonspor', 'Eyüpspor'),

  -- 13. Hafta
  ('SüperLig 13.Hafta', '2026-11-29 19:00:00+03', 'Beşiktaş', 'Galatasaray'),
  ('SüperLig 13.Hafta', '2026-11-29 19:00:00+03', 'Eyüpspor', 'Başakşehir'),
  ('SüperLig 13.Hafta', '2026-11-29 19:00:00+03', 'Fenerbahçe', 'Erzurumspor'),
  ('SüperLig 13.Hafta', '2026-11-29 19:00:00+03', 'Göztepe', 'Trabzonspor'),

  -- 14. Hafta
  ('SüperLig 14.Hafta', '2026-12-06 19:00:00+03', 'Başakşehir', 'Fenerbahçe'),
  ('SüperLig 14.Hafta', '2026-12-06 19:00:00+03', 'Beşiktaş', 'Samsunspor'),
  ('SüperLig 14.Hafta', '2026-12-06 19:00:00+03', 'Galatasaray', 'Çaykur Rizespor'),
  ('SüperLig 14.Hafta', '2026-12-06 19:00:00+03', 'Kasımpaşa', 'Göztepe'),
  ('SüperLig 14.Hafta', '2026-12-06 19:00:00+03', 'Trabzonspor', 'Çorum FK'),

  -- 15. Hafta
  ('SüperLig 15.Hafta', '2026-12-13 19:00:00+03', 'Çaykur Rizespor', 'Başakşehir'),
  ('SüperLig 15.Hafta', '2026-12-13 19:00:00+03', 'Eyüpspor', 'Galatasaray'),
  ('SüperLig 15.Hafta', '2026-12-13 19:00:00+03', 'Fenerbahçe', 'Trabzonspor'),
  ('SüperLig 15.Hafta', '2026-12-13 19:00:00+03', 'Gaziantep FK', 'Beşiktaş'),
  ('SüperLig 15.Hafta', '2026-12-13 19:00:00+03', 'Göztepe', 'Konyaspor'),

  -- 16. Hafta
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Amed Sportif Faaliyetler', 'Göztepe'),
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Başakşehir', 'Erzurumspor'),
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Beşiktaş', 'Çaykur Rizespor'),
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Galatasaray', 'Corendon Alanyaspor'),
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Kasımpaşa', 'Fenerbahçe'),
  ('SüperLig 16.Hafta', '2026-12-20 19:00:00+03', 'Trabzonspor', 'Kocaelispor'),

  -- 17. Hafta
  ('SüperLig 17.Hafta', '2027-01-17 19:00:00+03', 'Corendon Alanyaspor', 'Başakşehir'),
  ('SüperLig 17.Hafta', '2027-01-17 19:00:00+03', 'Erzurumspor', 'Trabzonspor'),
  ('SüperLig 17.Hafta', '2027-01-17 19:00:00+03', 'Fenerbahçe', 'Amed Sportif Faaliyetler'),
  ('SüperLig 17.Hafta', '2027-01-17 19:00:00+03', 'Gaziantep FK', 'Galatasaray'),
  ('SüperLig 17.Hafta', '2027-01-17 19:00:00+03', 'Göztepe', 'Beşiktaş'),

  -- 18. Hafta
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Çorum FK', 'Galatasaray'),
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Eyüpspor', 'Beşiktaş'),
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Fenerbahçe', 'Gençlerbirliği'),
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Göztepe', 'Samsunspor'),
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Kocaelispor', 'Başakşehir'),
  ('SüperLig 18.Hafta', '2027-01-24 19:00:00+03', 'Trabzonspor', 'Kasımpaşa'),

  -- 19. Hafta
  ('SüperLig 19.Hafta', '2027-01-31 19:00:00+03', 'Başakşehir', 'Trabzonspor'),
  ('SüperLig 19.Hafta', '2027-01-31 19:00:00+03', 'Beşiktaş', 'Corendon Alanyaspor'),
  ('SüperLig 19.Hafta', '2027-01-31 19:00:00+03', 'Galatasaray', 'Erzurumspor'),
  ('SüperLig 19.Hafta', '2027-01-31 19:00:00+03', 'Gençlerbirliği', 'Göztepe'),
  ('SüperLig 19.Hafta', '2027-01-31 19:00:00+03', 'Konyaspor', 'Fenerbahçe'),

  -- 20. Hafta
  ('SüperLig 20.Hafta', '2027-02-07 19:00:00+03', 'Çorum FK', 'Beşiktaş'),
  ('SüperLig 20.Hafta', '2027-02-07 19:00:00+03', 'Fenerbahçe', 'Samsunspor'),
  ('SüperLig 20.Hafta', '2027-02-07 19:00:00+03', 'Göztepe', 'Galatasaray'),
  ('SüperLig 20.Hafta', '2027-02-07 19:00:00+03', 'Kasımpaşa', 'Başakşehir'),
  ('SüperLig 20.Hafta', '2027-02-07 19:00:00+03', 'Trabzonspor', 'Amed Sportif Faaliyetler'),

  -- 21. Hafta
  ('SüperLig 21.Hafta', '2027-02-14 19:00:00+03', 'Beşiktaş', 'Fenerbahçe'),
  ('SüperLig 21.Hafta', '2027-02-14 19:00:00+03', 'Galatasaray', 'Başakşehir'),
  ('SüperLig 21.Hafta', '2027-02-14 19:00:00+03', 'Gaziantep FK', 'Göztepe'),
  ('SüperLig 21.Hafta', '2027-02-14 19:00:00+03', 'Gençlerbirliği', 'Trabzonspor'),

  -- 22. Hafta
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Başakşehir', 'Amed Sportif Faaliyetler'),
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Erzurumspor', 'Beşiktaş'),
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Fenerbahçe', 'Gaziantep FK'),
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Göztepe', 'Corendon Alanyaspor'),
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Kocaelispor', 'Galatasaray'),
  ('SüperLig 22.Hafta', '2027-02-21 19:00:00+03', 'Trabzonspor', 'Konyaspor'),

  -- 23. Hafta
  ('SüperLig 23.Hafta', '2027-02-28 19:00:00+03', 'Beşiktaş', 'Amed Sportif Faaliyetler'),
  ('SüperLig 23.Hafta', '2027-02-28 19:00:00+03', 'Çaykur Rizespor', 'Göztepe'),
  ('SüperLig 23.Hafta', '2027-02-28 19:00:00+03', 'Eyüpspor', 'Fenerbahçe'),
  ('SüperLig 23.Hafta', '2027-02-28 19:00:00+03', 'Galatasaray', 'Trabzonspor'),
  ('SüperLig 23.Hafta', '2027-02-28 19:00:00+03', 'Gençlerbirliği', 'Başakşehir'),

  -- 24. Hafta
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Başakşehir', 'Konyaspor'),
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Fenerbahçe', 'Çaykur Rizespor'),
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Göztepe', 'Eyüpspor'),
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Kasımpaşa', 'Galatasaray'),
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Kocaelispor', 'Beşiktaş'),
  ('SüperLig 24.Hafta', '2027-03-07 19:00:00+03', 'Trabzonspor', 'Samsunspor'),

  -- 25. Hafta
  ('SüperLig 25.Hafta', '2027-03-14 19:00:00+03', 'Beşiktaş', 'Trabzonspor'),
  ('SüperLig 25.Hafta', '2027-03-14 19:00:00+03', 'Corendon Alanyaspor', 'Fenerbahçe'),
  ('SüperLig 25.Hafta', '2027-03-14 19:00:00+03', 'Galatasaray', 'Gençlerbirliği'),
  ('SüperLig 25.Hafta', '2027-03-14 19:00:00+03', 'Gaziantep FK', 'Başakşehir'),
  ('SüperLig 25.Hafta', '2027-03-14 19:00:00+03', 'Göztepe', 'Kocaelispor'),

  -- 26. Hafta
  ('SüperLig 26.Hafta', '2027-03-21 19:00:00+03', 'Başakşehir', 'Beşiktaş'),
  ('SüperLig 26.Hafta', '2027-03-21 19:00:00+03', 'Çorum FK', 'Göztepe'),
  ('SüperLig 26.Hafta', '2027-03-21 19:00:00+03', 'Fenerbahçe', 'Galatasaray'),
  ('SüperLig 26.Hafta', '2027-03-21 19:00:00+03', 'Trabzonspor', 'Çaykur Rizespor'),

  -- 27. Hafta
  ('SüperLig 27.Hafta', '2027-04-04 19:00:00+03', 'Beşiktaş', 'Kasımpaşa'),
  ('SüperLig 27.Hafta', '2027-04-04 19:00:00+03', 'Galatasaray', 'Konyaspor'),
  ('SüperLig 27.Hafta', '2027-04-04 19:00:00+03', 'Gaziantep FK', 'Trabzonspor'),
  ('SüperLig 27.Hafta', '2027-04-04 19:00:00+03', 'Göztepe', 'Fenerbahçe'),
  ('SüperLig 27.Hafta', '2027-04-04 19:00:00+03', 'Samsunspor', 'Başakşehir'),

  -- 28. Hafta
  ('SüperLig 28.Hafta', '2027-04-11 19:00:00+03', 'Amed Sportif Faaliyetler', 'Galatasaray'),
  ('SüperLig 28.Hafta', '2027-04-11 19:00:00+03', 'Başakşehir', 'Göztepe'),
  ('SüperLig 28.Hafta', '2027-04-11 19:00:00+03', 'Fenerbahçe', 'Çorum FK'),
  ('SüperLig 28.Hafta', '2027-04-11 19:00:00+03', 'Gençlerbirliği', 'Beşiktaş'),
  ('SüperLig 28.Hafta', '2027-04-11 19:00:00+03', 'Trabzonspor', 'Corendon Alanyaspor'),

  -- 29. Hafta
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Beşiktaş', 'Konyaspor'),
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Çorum FK', 'Başakşehir'),
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Eyüpspor', 'Trabzonspor'),
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Fenerbahçe', 'Kocaelispor'),
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Göztepe', 'Erzurumspor'),
  ('SüperLig 29.Hafta', '2027-04-18 19:00:00+03', 'Samsunspor', 'Galatasaray'),

  -- 30. Hafta
  ('SüperLig 30.Hafta', '2027-04-25 19:00:00+03', 'Başakşehir', 'Eyüpspor'),
  ('SüperLig 30.Hafta', '2027-04-25 19:00:00+03', 'Erzurumspor', 'Fenerbahçe'),
  ('SüperLig 30.Hafta', '2027-04-25 19:00:00+03', 'Galatasaray', 'Beşiktaş'),
  ('SüperLig 30.Hafta', '2027-04-25 19:00:00+03', 'Trabzonspor', 'Göztepe'),

  -- 31. Hafta
  ('SüperLig 31.Hafta', '2027-05-02 19:00:00+03', 'Çaykur Rizespor', 'Galatasaray'),
  ('SüperLig 31.Hafta', '2027-05-02 19:00:00+03', 'Çorum FK', 'Trabzonspor'),
  ('SüperLig 31.Hafta', '2027-05-02 19:00:00+03', 'Fenerbahçe', 'Başakşehir'),
  ('SüperLig 31.Hafta', '2027-05-02 19:00:00+03', 'Göztepe', 'Kasımpaşa'),
  ('SüperLig 31.Hafta', '2027-05-02 19:00:00+03', 'Samsunspor', 'Beşiktaş'),

  -- 32. Hafta
  ('SüperLig 32.Hafta', '2027-05-09 19:00:00+03', 'Başakşehir', 'Çaykur Rizespor'),
  ('SüperLig 32.Hafta', '2027-05-09 19:00:00+03', 'Beşiktaş', 'Gaziantep FK'),
  ('SüperLig 32.Hafta', '2027-05-09 19:00:00+03', 'Galatasaray', 'Eyüpspor'),
  ('SüperLig 32.Hafta', '2027-05-09 19:00:00+03', 'Konyaspor', 'Göztepe'),
  ('SüperLig 32.Hafta', '2027-05-09 19:00:00+03', 'Trabzonspor', 'Fenerbahçe'),

  -- 33. Hafta
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Corendon Alanyaspor', 'Galatasaray'),
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Çaykur Rizespor', 'Beşiktaş'),
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Erzurumspor', 'Başakşehir'),
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Fenerbahçe', 'Kasımpaşa'),
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Göztepe', 'Amed Sportif Faaliyetler'),
  ('SüperLig 33.Hafta', '2027-05-16 19:00:00+03', 'Kocaelispor', 'Trabzonspor'),

  -- 34. Hafta
  ('SüperLig 34.Hafta', '2027-05-23 19:00:00+03', 'Amed Sportif Faaliyetler', 'Fenerbahçe'),
  ('SüperLig 34.Hafta', '2027-05-23 19:00:00+03', 'Başakşehir', 'Corendon Alanyaspor'),
  ('SüperLig 34.Hafta', '2027-05-23 19:00:00+03', 'Beşiktaş', 'Göztepe'),
  ('SüperLig 34.Hafta', '2027-05-23 19:00:00+03', 'Galatasaray', 'Gaziantep FK'),
  ('SüperLig 34.Hafta', '2027-05-23 19:00:00+03', 'Trabzonspor', 'Erzurumspor')
;

-- Sanity check: fail if any fixture team name did not resolve
do $$
declare
  missing_count int;
begin
  select count(*) into missing_count
  from tmp_fixtures_11_34 f
  where not exists (select 1 from public.teams t where t.name = f.home_name)
     or not exists (select 1 from public.teams t where t.name = f.away_name);

  if missing_count > 0 then
    raise exception 'FIXTURE_TEAM_MISSING: % unresolved team name(s)', missing_count;
  end if;
end $$;

-- Create missing weeks in numeric order (created_at staggered for admin list)
insert into public.weeks (label, status, created_at)
select
  format('SüperLig %s.Hafta', n),
  'draft',
  timestamptz '2026-08-17 12:00:00+00' + make_interval(hours => n)
from generate_series(11, 34) as n
where not exists (
  select 1
  from public.weeks w
  where w.label = format('SüperLig %s.Hafta', n)
);

insert into public.matches (week_id, home_team_id, away_team_id, kickoff_at)
select
  w.id,
  home.id,
  away.id,
  f.kickoff_at
from tmp_fixtures_11_34 f
join public.weeks w on w.label = f.week_label
join public.teams home on home.name = f.home_name
join public.teams away on away.name = f.away_name
where not exists (
  select 1
  from public.matches m
  where m.week_id = w.id
    and m.home_team_id = home.id
    and m.away_team_id = away.id
)
order by f.kickoff_at, f.home_name;

commit;

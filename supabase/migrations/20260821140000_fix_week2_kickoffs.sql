-- Week 2 kickoffs. Lock is first kickoff minus 1 hour (Cuma 20:30 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
--
--   21.08 21:30 Erzurumspor - Galatasaray
--   22.08 21:30 Fenerbahçe - Konyaspor
--   23.08 21:30 Trabzonspor - Başakşehir
--   23.08 21:30 Corendon Alanyaspor - Beşiktaş
--   23.08 21:30 Göztepe - Gençlerbirliği

update public.matches m
set kickoff_at = '2026-08-21 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 2.Hafta', '2026-27 2. Hafta')
  and home.name = 'Erzurumspor'
  and away.name = 'Galatasaray'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-22 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 2.Hafta', '2026-27 2. Hafta')
  and home.name = 'Fenerbahçe'
  and away.name = 'Konyaspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-23 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 2.Hafta', '2026-27 2. Hafta')
  and home.name = 'Trabzonspor'
  and away.name = 'Başakşehir'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-23 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 2.Hafta', '2026-27 2. Hafta')
  and home.name = 'Corendon Alanyaspor'
  and away.name = 'Beşiktaş'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-23 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 2.Hafta', '2026-27 2. Hafta')
  and home.name = 'Göztepe'
  and away.name = 'Gençlerbirliği'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

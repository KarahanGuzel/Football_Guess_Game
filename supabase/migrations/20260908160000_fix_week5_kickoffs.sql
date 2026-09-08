-- Week 5 kickoffs (TFF, 1 Sep 2026). Lock is first of our matches minus 1 hour (Cuma 19:00 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
--
--   11.09 20:00 Beşiktaş - Erzurumspor
--   12.09 20:00 Corendon Alanyaspor - Göztepe
--   12.09 20:00 Konyaspor - Trabzonspor
--   13.09 20:00 Amed Sportif Faaliyetler - Başakşehir
--   13.09 20:00 Galatasaray - Kocaelispor
--   14.09 20:00 Gaziantep FK - Fenerbahçe

update public.matches m
set kickoff_at = '2026-09-11 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Beşiktaş'
  and away.name = 'Erzurumspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-12 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Corendon Alanyaspor'
  and away.name = 'Göztepe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-12 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Konyaspor'
  and away.name = 'Trabzonspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-13 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Amed Sportif Faaliyetler'
  and away.name = 'Başakşehir'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-13 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Galatasaray'
  and away.name = 'Kocaelispor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-14 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 5.Hafta', '2026-27 5. Hafta')
  and home.name = 'Gaziantep FK'
  and away.name = 'Fenerbahçe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

-- Week 4 kickoffs (TFF). Lock is first of our matches minus 1 hour (Cuma 19:00 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
-- Fenerbahçe–Beşiktaş is a derby (×2); it cannot be the bonus match.
--
--   04.09 20:00 Başakşehir - Galatasaray
--   05.09 20:00 Fenerbahçe - Beşiktaş
--   06.09 20:00 Trabzonspor - Gençlerbirliği
--   07.09 20:00 Göztepe - Gaziantep FK

update public.matches m
set kickoff_at = '2026-09-04 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 4.Hafta', '2026-27 4. Hafta')
  and home.name = 'Başakşehir'
  and away.name = 'Galatasaray'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-05 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 4.Hafta', '2026-27 4. Hafta')
  and home.name = 'Fenerbahçe'
  and away.name = 'Beşiktaş'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-06 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 4.Hafta', '2026-27 4. Hafta')
  and home.name = 'Trabzonspor'
  and away.name = 'Gençlerbirliği'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-07 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 4.Hafta', '2026-27 4. Hafta')
  and home.name = 'Göztepe'
  and away.name = 'Gaziantep FK'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

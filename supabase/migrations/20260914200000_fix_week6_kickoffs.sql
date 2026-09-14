-- Week 6 kickoffs (TFF, 1 Sep 2026). Lock is first of our matches minus 1 hour (Cmt 19:00 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
-- League Friday (Kasımpaşa–Konyaspor) is not one of our matches.
-- Trabzonspor–Galatasaray is derby (×2, cannot be bonus).
--
--   19.09 20:00 Başakşehir - Gençlerbirliği
--   19.09 20:00 Trabzonspor - Galatasaray
--   20.09 17:00 Fenerbahçe - Eyüpspor
--   20.09 20:00 Göztepe - Çaykur Rizespor
--   20.09 20:00 Amed Sportif Faaliyetler - Beşiktaş

update public.matches m
set kickoff_at = '2026-09-19 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 6.Hafta', '2026-27 6. Hafta')
  and home.name = 'Başakşehir'
  and away.name = 'Gençlerbirliği'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-19 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 6.Hafta', '2026-27 6. Hafta')
  and home.name = 'Trabzonspor'
  and away.name = 'Galatasaray'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-20 17:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 6.Hafta', '2026-27 6. Hafta')
  and home.name = 'Fenerbahçe'
  and away.name = 'Eyüpspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-20 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 6.Hafta', '2026-27 6. Hafta')
  and home.name = 'Göztepe'
  and away.name = 'Çaykur Rizespor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-09-20 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 6.Hafta', '2026-27 6. Hafta')
  and home.name = 'Amed Sportif Faaliyetler'
  and away.name = 'Beşiktaş'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

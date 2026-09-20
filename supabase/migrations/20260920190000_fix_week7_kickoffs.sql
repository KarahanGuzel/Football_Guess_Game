-- Week 7 kickoffs (TFF, 15 Sep 2026). Lock is first of our matches minus 1 hour (Cuma 19:00 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
-- No derby this week (bonus can be any of the six).
--
--   09.10 20:00 Galatasaray - Kasımpaşa
--   10.10 16:00 Samsunspor - Trabzonspor
--   10.10 19:00 Çaykur Rizespor - Fenerbahçe
--   11.10 13:30 Konyaspor - Başakşehir
--   11.10 19:00 Beşiktaş - Kocaelispor
--   12.10 20:00 Eyüpspor - Göztepe

update public.matches m
set kickoff_at = '2026-10-09 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Galatasaray'
  and away.name = 'Kasımpaşa'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-10-10 16:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Samsunspor'
  and away.name = 'Trabzonspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-10-10 19:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Çaykur Rizespor'
  and away.name = 'Fenerbahçe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-10-11 13:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Konyaspor'
  and away.name = 'Başakşehir'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-10-11 19:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Beşiktaş'
  and away.name = 'Kocaelispor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-10-12 20:00:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 7.Hafta', '2026-27 7. Hafta')
  and home.name = 'Eyüpspor'
  and away.name = 'Göztepe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

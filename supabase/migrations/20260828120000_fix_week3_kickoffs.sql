-- Week 3 kickoffs (TFF). Lock is first of our matches minus 1 hour (Cmt 20:30 TR).
-- Pairings unchanged; only kickoff_at. Predictions stay.
--
--   29.08 21:30 Galatasaray - Göztepe
--   30.08 21:30 Başakşehir - Kasımpaşa
--   30.08 21:30 Samsunspor - Fenerbahçe
--   31.08 21:30 Amed Sportif Faaliyetler - Trabzonspor
--   31.08 21:30 Beşiktaş - Çorum FK

update public.matches m
set kickoff_at = '2026-08-29 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 3.Hafta', '2026-27 3. Hafta')
  and home.name = 'Galatasaray'
  and away.name = 'Göztepe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-30 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 3.Hafta', '2026-27 3. Hafta')
  and home.name = 'Başakşehir'
  and away.name = 'Kasımpaşa'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-30 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 3.Hafta', '2026-27 3. Hafta')
  and home.name = 'Samsunspor'
  and away.name = 'Fenerbahçe'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-31 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 3.Hafta', '2026-27 3. Hafta')
  and home.name = 'Amed Sportif Faaliyetler'
  and away.name = 'Trabzonspor'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

update public.matches m
set kickoff_at = '2026-08-31 21:30:00+03'
from public.weeks w,
     public.teams home,
     public.teams away
where m.week_id = w.id
  and w.label in ('SüperLig 3.Hafta', '2026-27 3. Hafta')
  and home.name = 'Beşiktaş'
  and away.name = 'Çorum FK'
  and m.home_team_id = home.id
  and m.away_team_id = away.id;

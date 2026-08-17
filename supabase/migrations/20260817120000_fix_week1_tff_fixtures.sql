-- Week 1: drop Göztepe–Başakşehir only. No new matches, no week reopen.
--
-- Göztepe and Başakşehir are treated as not playing in this league's week 1.
-- Predictions on the deleted row cascade away. All other week-1 picks stay.
-- Players do not need to re-enter anything.

-- Official TFF week 1 (for reference; the two Göztepe / Başakşehir games are omitted):
--   14.08 21:30 Galatasaray - Çorum FK          (kept)
--   15.08 19:00 Kasımpaşa - Trabzonspor         (not used; TS stays vs Kocaelispor)
--   15.08 21:30 Gençlerbirliği - Fenerbahçe     (kept; kickoff only)
--   16.08 19:00 Başakşehir - Kocaelispor        (omitted)
--   16.08 21:30 Beşiktaş - Eyüpspor             (not used; BJK stays vs Eyüpspor away)
--   17.08 21:30 Samsunspor - Göztepe            (omitted)

-- Kickoff only: same teams, picks stay.
update public.matches m
set kickoff_at = '2026-08-15 21:30:00+03'
from public.weeks w,
     public.teams gen,
     public.teams fb
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and gen.name = 'Gençlerbirliği'
  and fb.name = 'Fenerbahçe'
  and m.home_team_id = gen.id
  and m.away_team_id = fb.id;

delete from public.matches m
using public.weeks w, public.teams goz, public.teams bas
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and goz.name = 'Göztepe'
  and bas.name = 'Başakşehir'
  and m.home_team_id = goz.id
  and m.away_team_id = bas.id;

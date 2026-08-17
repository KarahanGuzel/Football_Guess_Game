-- Week 1 TFF corrections that do not remap existing picks.
--
-- Predictions stay on matches whose teams did not change (GS-Çorum, Gençlerbirliği-Fener).
-- Wrong pairings are deleted; those picks cascade away. Correct matches are inserted empty.
-- Week reopens with bypass_time_lock so players can fill the new rows after kickoff lock.

-- Official 2026-27 week 1 for tracked clubs:
--   14.08 21:30 Galatasaray - Çorum FK
--   15.08 19:00 Kasımpaşa - Trabzonspor
--   15.08 21:30 Gençlerbirliği - Fenerbahçe
--   16.08 19:00 Başakşehir - Kocaelispor
--   16.08 21:30 Beşiktaş - Eyüpspor
--   17.08 21:30 Samsunspor - Göztepe

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

-- Drop wrong pairings (predictions on these rows go with them).
delete from public.matches m
using public.weeks w, public.teams ts, public.teams koc
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and ts.name = 'Trabzonspor'
  and koc.name = 'Kocaelispor'
  and m.home_team_id = ts.id
  and m.away_team_id = koc.id;

delete from public.matches m
using public.weeks w, public.teams eyup, public.teams bjk
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and eyup.name = 'Eyüpspor'
  and bjk.name = 'Beşiktaş'
  and m.home_team_id = eyup.id
  and m.away_team_id = bjk.id;

delete from public.matches m
using public.weeks w, public.teams goz, public.teams bas
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and goz.name = 'Göztepe'
  and bas.name = 'Başakşehir'
  and m.home_team_id = goz.id
  and m.away_team_id = bas.id;

-- Insert the real matches if they are not already there.
insert into public.matches (week_id, home_team_id, away_team_id, kickoff_at)
select w.id, home.id, away.id, v.kickoff_at
from public.weeks w
cross join (
  values
    ('Kasımpaşa', 'Trabzonspor', timestamptz '2026-08-15 19:00:00+03'),
    ('Başakşehir', 'Kocaelispor', timestamptz '2026-08-16 19:00:00+03'),
    ('Beşiktaş', 'Eyüpspor', timestamptz '2026-08-16 21:30:00+03'),
    ('Samsunspor', 'Göztepe', timestamptz '2026-08-17 21:30:00+03')
) as v(home_name, away_name, kickoff_at)
join public.teams home on home.name = v.home_name
join public.teams away on away.name = v.away_name
where w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and not exists (
    select 1
    from public.matches m
    where m.week_id = w.id
      and m.home_team_id = home.id
      and m.away_team_id = away.id
  );

-- Let players fill the new empty rows even though kickoff lock already passed.
update public.weeks
set
  bypass_time_lock = true,
  status = case when status = 'locked' then 'open' else status end
where label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and status in ('draft', 'open', 'locked');

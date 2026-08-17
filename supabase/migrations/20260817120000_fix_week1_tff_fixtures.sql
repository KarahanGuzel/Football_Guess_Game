-- Week 1 remaining corrections vs TFF (idempotent).
-- Official 2026-27 week 1 for tracked clubs:
--   14.08 21:30 Galatasaray - Çorum FK          (already patched)
--   15.08 19:00 Kasımpaşa - Trabzonspor
--   15.08 21:30 Gençlerbirliği - Fenerbahçe
--   16.08 19:00 Başakşehir - Kocaelispor        (extra row; Göztepe was wrongly paired)
--   16.08 21:30 Beşiktaş - Eyüpspor
--   17.08 21:30 Samsunspor - Göztepe

-- Trabzonspor - Kocaelispor → Kasımpaşa - Trabzonspor
update public.matches m
set
  home_team_id = kas.id,
  away_team_id = ts.id,
  kickoff_at = '2026-08-15 19:00:00+03'
from public.weeks w,
     public.teams ts,
     public.teams koc,
     public.teams kas
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and ts.name = 'Trabzonspor'
  and koc.name = 'Kocaelispor'
  and kas.name = 'Kasımpaşa'
  and m.home_team_id = ts.id
  and m.away_team_id = koc.id;

-- Eyüpspor - Beşiktaş → Beşiktaş - Eyüpspor
update public.matches m
set
  home_team_id = bjk.id,
  away_team_id = eyup.id,
  kickoff_at = '2026-08-16 21:30:00+03'
from public.weeks w,
     public.teams bjk,
     public.teams eyup
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and bjk.name = 'Beşiktaş'
  and eyup.name = 'Eyüpspor'
  and m.home_team_id = eyup.id
  and m.away_team_id = bjk.id;

-- Göztepe - Başakşehir was one row covering two clubs. Split it:
--   Göztepe's match → Samsunspor - Göztepe
--   Başakşehir's match → insert Başakşehir - Kocaelispor
update public.matches m
set
  home_team_id = sam.id,
  away_team_id = goz.id,
  kickoff_at = '2026-08-17 21:30:00+03'
from public.weeks w,
     public.teams goz,
     public.teams bas,
     public.teams sam
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and goz.name = 'Göztepe'
  and bas.name = 'Başakşehir'
  and sam.name = 'Samsunspor'
  and m.home_team_id = goz.id
  and m.away_team_id = bas.id;

insert into public.matches (week_id, home_team_id, away_team_id, kickoff_at)
select w.id, bas.id, koc.id, timestamptz '2026-08-16 19:00:00+03'
from public.weeks w
join public.teams bas on bas.name = 'Başakşehir'
join public.teams koc on koc.name = 'Kocaelispor'
where w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and not exists (
    select 1
    from public.matches m
    where m.week_id = w.id
      and m.home_team_id = bas.id
      and m.away_team_id = koc.id
  );

-- Gençlerbirliği - Fenerbahçe kickoff was left at 16.08 19:00
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

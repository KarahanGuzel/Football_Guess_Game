-- Week 1 fixture corrections (idempotent).
-- 1) Fenerbahçe vs Erzurumspor was seeded by mistake → Gençlerbirliği - Fenerbahçe.
-- 2) Galatasaray vs Çorum FK kickoff is 14 Aug 2026 21:30 TR, not 16 Aug 19:00.

update public.matches m
set
  home_team_id = gen.id,
  away_team_id = fb.id
from public.weeks w,
     public.teams fb,
     public.teams erz,
     public.teams gen
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and fb.name = 'Fenerbahçe'
  and erz.name = 'Erzurumspor'
  and gen.name = 'Gençlerbirliği'
  and m.home_team_id = fb.id
  and m.away_team_id = erz.id;

update public.matches m
set kickoff_at = '2026-08-14 21:30:00+03'
from public.weeks w,
     public.teams gs,
     public.teams corum
where m.week_id = w.id
  and w.label in ('SüperLig 1.Hafta', '2026-27 1. Hafta')
  and gs.name = 'Galatasaray'
  and corum.name = 'Çorum FK'
  and m.home_team_id = gs.id
  and m.away_team_id = corum.id;

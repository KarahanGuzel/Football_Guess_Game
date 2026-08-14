-- Week 1 was seeded as Fenerbahçe vs Erzurumspor by mistake.
-- Official fixture: Gençlerbirliği - Fenerbahçe (same kickoff).
-- Idempotent: no-op if that pair is already gone.

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

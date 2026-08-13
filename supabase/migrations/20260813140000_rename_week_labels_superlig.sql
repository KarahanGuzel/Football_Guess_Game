-- Rename seeded week labels from season-year style to competition style.
-- Example: 2026-27 1. Hafta → SüperLig 1.Hafta
-- Safe if already renamed (0 rows updated).

begin;

update public.weeks
set label = regexp_replace(
  label,
  '^2026-27[[:space:]]+(\d+)\.[[:space:]]*Hafta$',
  'SüperLig \1.Hafta'
)
where label ~ '^2026-27[[:space:]]+\d+\.[[:space:]]*Hafta$';

commit;

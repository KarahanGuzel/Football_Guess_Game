-- Homepage lig defteri slot settings (admin-editable).
-- Safe to re-run.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values (
  'lig_defteri',
  '{
    "slots": [
      {"mode":"auto","autoStoryId":null,"kicker":"","headline":"","detail":""},
      {"mode":"auto","autoStoryId":null,"kicker":"","headline":"","detail":""},
      {"mode":"auto","autoStoryId":null,"kicker":"","headline":"","detail":""},
      {"mode":"auto","autoStoryId":null,"kicker":"","headline":"","detail":""},
      {"mode":"auto","autoStoryId":null,"kicker":"","headline":"","detail":""}
    ]
  }'::jsonb
)
on conflict (key) do nothing;

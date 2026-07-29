-- Add player İsmail (Fenerbahçe / sarı-lacivert fan colors via app mapping)

insert into public.players (display_name, slug, is_admin)
values ('İsmail', 'ismail', false)
on conflict (slug) do update
set
  display_name = excluded.display_name,
  is_admin = excluded.is_admin,
  is_active = true;

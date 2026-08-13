-- Weekly prediction-slip comments (per player cup / küpür, not per match).

begin;

create table public.slip_comments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  target_player_id uuid not null references public.players (id) on delete cascade,
  author_player_id uuid not null references public.players (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint slip_comments_body_not_blank check (length(trim(body)) > 0),
  constraint slip_comments_body_max_len check (char_length(body) <= 280)
);

create index slip_comments_week_target_idx
  on public.slip_comments (week_id, target_player_id, created_at);

create index slip_comments_author_idx
  on public.slip_comments (author_player_id);

alter table public.slip_comments enable row level security;
revoke all on table public.slip_comments from anon, authenticated;

commit;

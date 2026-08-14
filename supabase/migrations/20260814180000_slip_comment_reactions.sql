-- Emoji reactions on küpür comments (🔥 😂 👏).
-- One player may use several emojis on the same comment; click again to remove.

begin;

create table public.slip_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.slip_comments (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  constraint slip_comment_reactions_kind
    check (reaction in ('fire', 'laugh', 'clap')),
  constraint slip_comment_reactions_unique
    unique (comment_id, player_id, reaction)
);

create index slip_comment_reactions_comment_idx
  on public.slip_comment_reactions (comment_id);

alter table public.slip_comment_reactions enable row level security;
revoke all on table public.slip_comment_reactions from anon, authenticated;

commit;

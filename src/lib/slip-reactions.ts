export const SLIP_REACTION_KEYS = ["fire", "laugh", "clap"] as const;

export type SlipReactionKey = (typeof SLIP_REACTION_KEYS)[number];

export const SLIP_REACTION_GLYPH: Record<SlipReactionKey, string> = {
  fire: "🔥",
  laugh: "😂",
  clap: "👏",
};

export const SLIP_REACTION_LABEL: Record<SlipReactionKey, string> = {
  fire: "Ateş",
  laugh: "Kahkaha",
  clap: "Alkış",
};

export type SlipCommentReaction = {
  player_id: string;
  reaction: SlipReactionKey;
};

export type SlipReactionChip = {
  key: SlipReactionKey;
  glyph: string;
  label: string;
  count: number;
  mine: boolean;
};

export function isSlipReactionKey(value: string): value is SlipReactionKey {
  return (SLIP_REACTION_KEYS as readonly string[]).includes(value);
}

export function attachCommentReactions<T extends { id: string }>(
  comments: T[],
  rows: { comment_id: string; player_id: string; reaction: string }[],
): (T & { reactions: SlipCommentReaction[] })[] {
  const byComment = new Map<string, SlipCommentReaction[]>();
  for (const row of rows) {
    if (!isSlipReactionKey(row.reaction)) continue;
    const list = byComment.get(row.comment_id) ?? [];
    list.push({ player_id: row.player_id, reaction: row.reaction });
    byComment.set(row.comment_id, list);
  }

  return comments.map((comment) => ({
    ...comment,
    reactions: byComment.get(comment.id) ?? [],
  }));
}

export function summarizeCommentReactions(
  reactions: SlipCommentReaction[],
  currentPlayerId: string,
): SlipReactionChip[] {
  return SLIP_REACTION_KEYS.map((key) => ({
    key,
    glyph: SLIP_REACTION_GLYPH[key],
    label: SLIP_REACTION_LABEL[key],
    count: reactions.filter((row) => row.reaction === key).length,
    mine: reactions.some(
      (row) => row.reaction === key && row.player_id === currentPlayerId,
    ),
  }));
}

export function toggleReactionList(
  reactions: SlipCommentReaction[],
  playerId: string,
  key: SlipReactionKey,
): SlipCommentReaction[] {
  const has = reactions.some(
    (row) => row.player_id === playerId && row.reaction === key,
  );
  if (has) {
    return reactions.filter(
      (row) => !(row.player_id === playerId && row.reaction === key),
    );
  }
  return [...reactions, { player_id: playerId, reaction: key }];
}

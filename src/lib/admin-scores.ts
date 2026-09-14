import type { Match } from "@/types/database";

export type ScoreDraft = { home: string; away: string };

function parseGoal(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function areLocalScoresComplete(
  matches: Pick<Match, "id">[],
  scores: Record<string, ScoreDraft>,
): boolean {
  if (matches.length === 0) return false;
  return matches.every((match) => {
    const row = scores[match.id];
    if (!row) return false;
    return parseGoal(row.home) != null && parseGoal(row.away) != null;
  });
}

/** True when every match already has DB scores and the form matches them. */
export function areLocalScoresSaved(
  matches: Pick<Match, "id" | "home_goals" | "away_goals">[],
  scores: Record<string, ScoreDraft>,
): boolean {
  if (matches.length === 0) return false;
  return matches.every((match) => {
    if (match.home_goals == null || match.away_goals == null) return false;
    const row = scores[match.id];
    if (!row) return false;
    const home = parseGoal(row.home);
    const away = parseGoal(row.away);
    return home === match.home_goals && away === match.away_goals;
  });
}

export function scoreAdminButtons(
  matches: Pick<Match, "id" | "home_goals" | "away_goals">[],
  scores: Record<string, ScoreDraft>,
): { canSave: boolean; canCalculate: boolean } {
  const complete = areLocalScoresComplete(matches, scores);
  const saved = areLocalScoresSaved(matches, scores);
  return {
    canSave: complete && !saved,
    canCalculate: complete && saved,
  };
}

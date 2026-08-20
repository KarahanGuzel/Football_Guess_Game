import type { GoalsMarket, Player, PredictResult, Prediction } from "@/types/database";

export type AgreeingPlayer = {
  playerId: string;
  displayName: string;
  slug: string;
};

/** Other players who matched both result and over/under on this match. */
export function playersWithSamePick(input: {
  matchId: string;
  currentPlayerId: string;
  result: PredictResult;
  goalsMarket: GoalsMarket;
  predictions: (Prediction & { player: Player })[];
}): AgreeingPlayer[] {
  const seen = new Set<string>();
  const allies: AgreeingPlayer[] = [];

  for (const prediction of input.predictions) {
    if (prediction.match_id !== input.matchId) continue;
    if (prediction.player_id === input.currentPlayerId) continue;
    if (prediction.result !== input.result) continue;
    if (prediction.goals_market !== input.goalsMarket) continue;
    if (seen.has(prediction.player_id)) continue;
    seen.add(prediction.player_id);
    allies.push({
      playerId: prediction.player.id,
      displayName: prediction.player.display_name,
      slug: prediction.player.slug,
    });
  }

  return allies.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "tr"),
  );
}

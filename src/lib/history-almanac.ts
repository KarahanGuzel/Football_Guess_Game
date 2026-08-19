import type { MatchWithTeams, Player, Prediction } from "@/types/database";
import { weekNumberFromLabel } from "@/lib/week-label";

type PredictionWithPlayer = Prediction & { player: Player };

export type AlmanacWeekSummary = {
  weekNo: string | null;
  stamp: "Puanlandı" | "Kilitli";
  kingNames: string[];
  kingPoints: number | null;
  yourPoints: number | null;
  teamNames: string[];
  matchCount: number;
};

function pointsByPlayer(
  predictions: PredictionWithPlayer[],
): Map<string, { points: number; name: string }> {
  const map = new Map<string, { points: number; name: string }>();
  for (const prediction of predictions) {
    if (prediction.points_earned == null) continue;
    const current = map.get(prediction.player_id);
    if (current) {
      current.points += prediction.points_earned;
    } else {
      map.set(prediction.player_id, {
        points: prediction.points_earned,
        name: prediction.player.display_name,
      });
    }
  }
  return map;
}

export function summarizeAlmanacWeek(input: {
  label: string;
  status: string;
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
  currentPlayerId: string;
}): AlmanacWeekSummary {
  const scored = input.status === "scored";
  const totals = scored ? pointsByPlayer(input.predictions) : new Map();
  const ranked = [...totals.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name, "tr");
  });
  const top = ranked[0]?.points ?? null;
  const kingNames =
    top == null ? [] : ranked.filter((row) => row.points === top).map((row) => row.name);

  const your = totals.get(input.currentPlayerId)?.points ?? null;

  const teamNames: string[] = [];
  const seen = new Set<string>();
  for (const match of input.matches) {
    for (const name of [match.home_team.name, match.away_team.name]) {
      if (seen.has(name)) continue;
      seen.add(name);
      teamNames.push(name);
    }
  }

  return {
    weekNo: weekNumberFromLabel(input.label),
    stamp: scored ? "Puanlandı" : "Kilitli",
    kingNames,
    kingPoints: top,
    yourPoints: your,
    teamNames,
    matchCount: input.matches.length,
  };
}

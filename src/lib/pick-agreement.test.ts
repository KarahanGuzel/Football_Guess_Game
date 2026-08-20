import { describe, expect, it } from "vitest";
import { playersWithSamePick } from "@/lib/pick-agreement";
import type { Player, Prediction } from "@/types/database";

function player(id: string, name: string): Player {
  return { id, display_name: name, slug: id, is_admin: false, is_active: true };
}

function pick(
  playerId: string,
  name: string,
  matchId: string,
  result: Prediction["result"],
  goals: Prediction["goals_market"],
): Prediction & { player: Player } {
  return {
    id: `${playerId}-${matchId}`,
    player_id: playerId,
    match_id: matchId,
    result,
    goals_market: goals,
    result_correct: null,
    goals_correct: null,
    points_earned: null,
    player: player(playerId, name),
  };
}

describe("playersWithSamePick", () => {
  const predictions = [
    pick("karahan", "Karahan", "m1", "home", "over_25"),
    pick("bugra", "Buğra", "m1", "home", "over_25"),
    pick("kaan", "Kaan", "m1", "home", "under_25"),
    pick("batuhan", "Batuhan", "m1", "away", "over_25"),
    pick("bugra", "Buğra", "m2", "home", "over_25"),
  ];

  it("lists others who matched both markets, excluding you", () => {
    expect(
      playersWithSamePick({
        matchId: "m1",
        currentPlayerId: "karahan",
        result: "home",
        goalsMarket: "over_25",
        predictions,
      }).map((row) => row.playerId),
    ).toEqual(["bugra"]);
  });

  it("returns empty when nobody else shares the pick", () => {
    expect(
      playersWithSamePick({
        matchId: "m1",
        currentPlayerId: "batuhan",
        result: "away",
        goalsMarket: "over_25",
        predictions,
      }),
    ).toEqual([]);
  });
});

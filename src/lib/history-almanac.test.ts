import { describe, expect, it } from "vitest";
import { summarizeAlmanacWeek } from "@/lib/history-almanac";
import { matchClubWashStyle } from "@/lib/team-colors";
import { weekNumberFromLabel } from "@/lib/week-label";
import type { MatchWithTeams, Player, Prediction } from "@/types/database";

function team(name: string, id: string) {
  return {
    id,
    name,
    short_name: name.slice(0, 3).toUpperCase(),
    is_derby_club: false,
    sort_order: 1,
  };
}

function match(
  id: string,
  home: string,
  away: string,
  derby = false,
): MatchWithTeams {
  return {
    id,
    week_id: "w1",
    home_team_id: home,
    away_team_id: away,
    kickoff_at: "2026-08-16T16:00:00.000Z",
    is_bonus: false,
    is_derby: derby,
    home_goals: 1,
    away_goals: 0,
    status: "finished",
    home_team: team(home, home),
    away_team: team(away, away),
  };
}

function player(id: string, name: string): Player {
  return { id, display_name: name, slug: id, is_admin: false, is_active: true };
}

function pick(
  playerId: string,
  name: string,
  matchId: string,
  points: number,
): Prediction & { player: Player } {
  return {
    id: `${playerId}-${matchId}`,
    player_id: playerId,
    match_id: matchId,
    result: "home",
    goals_market: "over_25",
    result_correct: true,
    goals_correct: true,
    points_earned: points,
    player: player(playerId, name),
  };
}

describe("weekNumberFromLabel", () => {
  it("pads Super Lig week numbers", () => {
    expect(weekNumberFromLabel("SüperLig 1.Hafta")).toBe("01");
    expect(weekNumberFromLabel("SüperLig 10.Hafta")).toBe("10");
  });

  it("returns null when there is no week number", () => {
    expect(weekNumberFromLabel("Hazırlık")).toBeNull();
  });
});

describe("matchClubWashStyle", () => {
  it("uses the home club pair", () => {
    expect(
      matchClubWashStyle({
        isDerby: false,
        homeName: "Galatasaray",
        awayName: "Çorum FK",
      }),
    ).toEqual({
      "--club-a": "#FDB912",
      "--club-b": "#A90432",
    });
  });

  it("mixes both primaries on a derby", () => {
    expect(
      matchClubWashStyle({
        isDerby: true,
        homeName: "Fenerbahçe",
        awayName: "Galatasaray",
      }),
    ).toEqual({
      "--club-a": "#FFED00",
      "--club-b": "#FDB912",
    });
  });
});

describe("summarizeAlmanacWeek", () => {
  const matches = [
    match("m1", "Galatasaray", "Çorum FK"),
    match("m2", "Fenerbahçe", "Konyaspor"),
  ];

  it("names the week king and your points", () => {
    const summary = summarizeAlmanacWeek({
      label: "SüperLig 1.Hafta",
      status: "scored",
      matches,
      predictions: [
        pick("karahan", "Karahan", "m1", 8),
        pick("karahan", "Karahan", "m2", 4),
        pick("bugra", "Buğra", "m1", 4),
      ],
      currentPlayerId: "bugra",
    });

    expect(summary.weekNo).toBe("01");
    expect(summary.stamp).toBe("Puanlandı");
    expect(summary.kingNames).toEqual(["Karahan"]);
    expect(summary.kingPoints).toBe(12);
    expect(summary.yourPoints).toBe(4);
    expect(summary.teamNames).toEqual([
      "Galatasaray",
      "Çorum FK",
      "Fenerbahçe",
      "Konyaspor",
    ]);
  });

  it("keeps locked weeks without kings", () => {
    const summary = summarizeAlmanacWeek({
      label: "SüperLig 2.Hafta",
      status: "locked",
      matches,
      predictions: [pick("karahan", "Karahan", "m1", 8)],
      currentPlayerId: "karahan",
    });
    expect(summary.stamp).toBe("Kilitli");
    expect(summary.kingNames).toEqual([]);
    expect(summary.yourPoints).toBeNull();
  });
});

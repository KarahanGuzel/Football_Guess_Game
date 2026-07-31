import { describe, expect, it } from "vitest";
import {
  findFixtureForMatch,
  normalizeTeamKey,
  teamNamesMatch,
} from "@/lib/match-preview-match";
import type { MatchWithTeams } from "@/types/database";

describe("normalizeTeamKey", () => {
  it("strips Turkish characters", () => {
    expect(normalizeTeamKey("Fenerbahçe")).toBe("fenerbahce");
    expect(normalizeTeamKey("Beşiktaş")).toBe("besiktas");
    expect(normalizeTeamKey("Başakşehir")).toBe("basaksehir");
  });
});

describe("teamNamesMatch", () => {
  it("matches Başakşehir aliases", () => {
    expect(teamNamesMatch("Başakşehir", "Istanbul Basaksehir")).toBe(true);
    expect(teamNamesMatch("Göztepe", "Goztepe")).toBe(true);
  });
});

describe("findFixtureForMatch", () => {
  const baseMatch = {
    id: "m1",
    week_id: "w1",
    home_team_id: "t1",
    away_team_id: "t2",
    kickoff_at: "2026-08-15T16:00:00.000Z",
    is_bonus: false,
    is_derby: false,
    home_goals: null,
    away_goals: null,
    status: "scheduled" as const,
    api_football_fixture_id: null,
    home_team: {
      id: "t1",
      name: "Fenerbahçe",
      short_name: "FB",
      is_derby_club: true,
      sort_order: 1,
      api_football_id: null,
    },
    away_team: {
      id: "t2",
      name: "Göztepe",
      short_name: "GÖZ",
      is_derby_club: false,
      sort_order: 6,
      api_football_id: null,
    },
  } satisfies MatchWithTeams;

  it("picks the closest kickoff among matching teams", () => {
    const found = findFixtureForMatch(baseMatch, [
      {
        fixtureId: 1,
        kickoffAt: "2026-08-15T18:00:00+03:00",
        home: { id: 1, name: "Fenerbahce" },
        away: { id: 2, name: "Goztepe" },
        statusShort: "NS",
      },
      {
        fixtureId: 2,
        kickoffAt: "2026-08-22T18:00:00+03:00",
        home: { id: 1, name: "Fenerbahce" },
        away: { id: 2, name: "Goztepe" },
        statusShort: "NS",
      },
    ]);
    expect(found?.fixtureId).toBe(1);
  });
});

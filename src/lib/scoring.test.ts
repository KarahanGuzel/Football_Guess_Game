import { describe, expect, it } from "vitest";
import {
  actualGoalsMarket,
  actualResult,
  detectDerby,
  scorePrediction,
} from "@/lib/scoring";
import { effectiveWeekStatus, isWeekLockedByTime, weekLockAt } from "@/lib/week-lock";

describe("actualResult / actualGoalsMarket", () => {
  it("resolves 1X2 correctly", () => {
    expect(actualResult(2, 1)).toBe("home");
    expect(actualResult(1, 2)).toBe("away");
    expect(actualResult(1, 1)).toBe("draw");
  });

  it("uses strict over 2.5 boundary", () => {
    expect(actualGoalsMarket(1, 1)).toBe("under_25"); // 2
    expect(actualGoalsMarket(2, 0)).toBe("under_25"); // 2
    expect(actualGoalsMarket(2, 1)).toBe("over_25"); // 3
    expect(actualGoalsMarket(3, 0)).toBe("over_25"); // 3
  });
});

describe("scorePrediction matrix", () => {
  const cases: Array<{
    name: string;
    input: Parameters<typeof scorePrediction>[0];
    points: number;
  }> = [
    {
      name: "normal miss",
      input: {
        result: "away",
        goalsMarket: "under_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      },
      points: 0,
    },
    {
      name: "normal result only",
      input: {
        result: "home",
        goalsMarket: "under_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      },
      points: 2,
    },
    {
      name: "normal O/U only",
      input: {
        result: "draw",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      },
      points: 1,
    },
    {
      name: "normal perfect",
      input: {
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      },
      points: 4,
    },
    {
      name: "derby result only",
      input: {
        result: "home",
        goalsMarket: "under_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: true,
      },
      points: 4,
    },
    {
      name: "derby O/U only",
      input: {
        result: "draw",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: true,
      },
      points: 2,
    },
    {
      name: "derby perfect",
      input: {
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: true,
      },
      points: 8,
    },
    {
      name: "bonus result only = 0",
      input: {
        result: "home",
        goalsMarket: "under_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: false,
      },
      points: 0,
    },
    {
      name: "bonus O/U only = 0",
      input: {
        result: "draw",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: false,
      },
      points: 0,
    },
    {
      name: "bonus perfect = 6",
      input: {
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: false,
      },
      points: 6,
    },
  ];

  for (const testCase of cases) {
    it(testCase.name, () => {
      expect(scorePrediction(testCase.input).pointsEarned).toBe(testCase.points);
    });
  }

  it("rejects bonus+derby", () => {
    expect(() =>
      scorePrediction({
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: true,
      }),
    ).toThrow("BONUS_DERBY_CONFLICT");
  });
});

describe("detectDerby", () => {
  it("only when both sides are derby clubs", () => {
    expect(detectDerby(true, true)).toBe(true);
    expect(detectDerby(true, false)).toBe(false);
    expect(detectDerby(false, true)).toBe(false);
    expect(detectDerby(false, false)).toBe(false);
  });
});

describe("week lock", () => {
  it("locks at first kickoff and picks earliest match", () => {
    const matches = [
      { kickoff_at: "2026-07-24T18:00:00.000Z" },
      { kickoff_at: "2026-07-23T18:00:00.000Z" },
    ];
    expect(weekLockAt(matches)?.toISOString()).toBe("2026-07-23T18:00:00.000Z");
    expect(
      isWeekLockedByTime("open", matches, new Date("2026-07-23T18:00:00.000Z")),
    ).toBe(true);
    expect(
      isWeekLockedByTime("open", matches, new Date("2026-07-23T17:59:59.000Z")),
    ).toBe(false);
    expect(
      effectiveWeekStatus(
        { status: "open" },
        matches,
        new Date("2026-07-23T19:00:00.000Z"),
      ),
    ).toBe("locked");
    expect(
      effectiveWeekStatus(
        { status: "scored" },
        matches,
        new Date("2026-07-23T10:00:00.000Z"),
      ),
    ).toBe("scored");
  });
});

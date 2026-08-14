import { describe, expect, it } from "vitest";
import { detectDerby, scorePrediction } from "@/lib/scoring";
import { effectiveWeekStatus, isWeekLockedByTime } from "@/lib/week-lock";

describe("scorePrediction", () => {
  it("scores normal markets", () => {
    expect(
      scorePrediction({
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      }).pointsEarned,
    ).toBe(4);

    expect(
      scorePrediction({
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 1,
        awayGoals: 0,
        isBonus: false,
        isDerby: false,
      }).pointsEarned,
    ).toBe(2);

    expect(
      scorePrediction({
        result: "draw",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: false,
      }).pointsEarned,
    ).toBe(1);
  });

  it("doubles derby points and uses bonus all-or-nothing", () => {
    expect(
      scorePrediction({
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: false,
        isDerby: true,
      }).pointsEarned,
    ).toBe(8);

    expect(
      scorePrediction({
        result: "home",
        goalsMarket: "over_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: false,
      }).pointsEarned,
    ).toBe(6);

    expect(
      scorePrediction({
        result: "home",
        goalsMarket: "under_25",
        homeGoals: 2,
        awayGoals: 1,
        isBonus: true,
        isDerby: false,
      }).pointsEarned,
    ).toBe(0);
  });

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
  it("requires both clubs to be derby clubs", () => {
    expect(detectDerby(true, true)).toBe(true);
    expect(detectDerby(true, false)).toBe(false);
  });
});

describe("week lock", () => {
  it("locks one hour before first kickoff", () => {
    const matches = [
      { kickoff_at: "2026-07-23T18:00:00.000Z" },
      { kickoff_at: "2026-07-24T18:00:00.000Z" },
    ];
    expect(
      isWeekLockedByTime("open", matches, new Date("2026-07-23T17:00:00.000Z")),
    ).toBe(true);
    expect(
      isWeekLockedByTime("open", matches, new Date("2026-07-23T16:59:59.000Z")),
    ).toBe(false);
    expect(
      effectiveWeekStatus(
        { status: "open" },
        matches,
        new Date("2026-07-23T17:30:00.000Z"),
      ),
    ).toBe("locked");
  });
});

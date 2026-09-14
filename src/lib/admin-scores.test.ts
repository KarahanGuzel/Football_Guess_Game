import { describe, expect, it } from "vitest";
import { scoreAdminButtons } from "@/lib/admin-scores";

const matches = [
  { id: "m1", home_goals: null as number | null, away_goals: null as number | null },
  { id: "m2", home_goals: null as number | null, away_goals: null as number | null },
];

describe("scoreAdminButtons", () => {
  it("keeps both buttons off until every score is filled", () => {
    expect(
      scoreAdminButtons(matches, {
        m1: { home: "1", away: "0" },
        m2: { home: "", away: "2" },
      }),
    ).toEqual({ canSave: false, canCalculate: false });
  });

  it("enables save only after all scores are filled and not yet stored", () => {
    expect(
      scoreAdminButtons(matches, {
        m1: { home: "1", away: "0" },
        m2: { home: "2", away: "2" },
      }),
    ).toEqual({ canSave: true, canCalculate: false });
  });

  it("enables calculate only after saved scores match the form", () => {
    const saved = [
      { id: "m1", home_goals: 1, away_goals: 0 },
      { id: "m2", home_goals: 2, away_goals: 2 },
    ];
    expect(
      scoreAdminButtons(saved, {
        m1: { home: "1", away: "0" },
        m2: { home: "2", away: "2" },
      }),
    ).toEqual({ canSave: false, canCalculate: true });
  });

  it("requires save again after an edit", () => {
    const saved = [
      { id: "m1", home_goals: 1, away_goals: 0 },
      { id: "m2", home_goals: 2, away_goals: 2 },
    ];
    expect(
      scoreAdminButtons(saved, {
        m1: { home: "1", away: "2" },
        m2: { home: "2", away: "2" },
      }),
    ).toEqual({ canSave: true, canCalculate: false });
  });
});

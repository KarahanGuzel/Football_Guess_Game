import { describe, expect, it } from "vitest";
import { buildLigDefteri, type DefteriMatch, type DefteriPick } from "@/lib/lig-defteri";

function match(
  id: string,
  homeName: string,
  awayName: string,
  extra: Partial<DefteriMatch> = {},
): DefteriMatch {
  return {
    id,
    weekLabel: extra.weekLabel ?? "SüperLig 6.Hafta",
    homeName,
    awayName,
    isDerby: extra.isDerby ?? false,
    isBonus: extra.isBonus ?? false,
    homeGoals: extra.homeGoals ?? null,
    awayGoals: extra.awayGoals ?? null,
  };
}

function pick(
  matchId: string,
  playerId: string,
  playerName: string,
  result: DefteriPick["result"],
  extra: Partial<DefteriPick> = {},
): DefteriPick {
  return {
    matchId,
    playerId,
    playerName,
    result,
    goalsMarket: extra.goalsMarket ?? "over_25",
    resultCorrect: extra.resultCorrect ?? null,
    pointsEarned: extra.pointsEarned ?? null,
  };
}

describe("buildLigDefteri", () => {
  it("returns null when there is nothing interesting yet", () => {
    expect(
      buildLigDefteri({
        currentWeekLabel: "SüperLig 6.Hafta",
        currentMatches: [match("m1", "Göztepe", "Rizespor")],
        currentPicks: [pick("m1", "p1", "Karahan", "home")],
        scoredWeeks: [],
      }),
    ).toBeNull();
  });

  it("leads with a unanimous current-week pick", () => {
    const card = buildLigDefteri({
      currentWeekLabel: "SüperLig 6.Hafta",
      currentMatches: [match("m1", "Fenerbahçe", "Eyüpspor")],
      currentPicks: [
        pick("m1", "a", "Karahan", "home"),
        pick("m1", "b", "Batuhan", "home"),
        pick("m1", "c", "Buğra", "home"),
      ],
      scoredWeeks: [],
    });
    expect(card?.kicker).toBe("Bu hafta");
    expect(card?.headline).toBe("Herkes Fenerbahçe dedi.");
    expect(card?.detail).toBe("Fenerbahçe–Eyüpspor");
  });

  it("calls out the lone wolf on a split match", () => {
    const card = buildLigDefteri({
      currentWeekLabel: "SüperLig 6.Hafta",
      currentMatches: [match("m1", "Amed", "Beşiktaş")],
      currentPicks: [
        pick("m1", "a", "Karahan", "away"),
        pick("m1", "b", "Batuhan", "away"),
        pick("m1", "c", "Buğra", "away"),
        pick("m1", "d", "Emrah", "home"),
      ],
      scoredWeeks: [],
    });
    expect(card?.headline).toBe("Sadece Emrah Amed dedi.");
  });

  it("uses last week’s miss when nobody had the result", () => {
    const m = match("m1", "Alanyaspor", "Göztepe", {
      weekLabel: "SüperLig 5.Hafta",
      homeGoals: 0,
      awayGoals: 2,
    });
    const card = buildLigDefteri({
      currentWeekLabel: null,
      currentMatches: [],
      currentPicks: [],
      scoredWeeks: [
        {
          label: "SüperLig 5.Hafta",
          matches: [m],
          picks: [
            pick("m1", "a", "Karahan", "home", { resultCorrect: false }),
            pick("m1", "b", "Batuhan", "home", { resultCorrect: false }),
            pick("m1", "c", "Buğra", "draw", { resultCorrect: false }),
          ],
        },
      ],
    });
    expect(card?.kicker).toBe("5. hafta");
    expect(card?.headline).toBe("Kimse Göztepe dememişti.");
  });

  it("adds a bonus chip from season totals", () => {
    const bonus = match("b1", "Başakşehir", "Gençler", { isBonus: true });
    const card = buildLigDefteri({
      currentWeekLabel: "SüperLig 6.Hafta",
      currentMatches: [match("m1", "Fenerbahçe", "Eyüpspor")],
      currentPicks: [
        pick("m1", "a", "Karahan", "home"),
        pick("m1", "b", "Batuhan", "home"),
        pick("m1", "c", "Buğra", "home"),
      ],
      scoredWeeks: [
        {
          label: "SüperLig 4.Hafta",
          matches: [bonus],
          picks: [
            pick("b1", "a", "Karahan", "home", { pointsEarned: 6 }),
            pick("b1", "b", "Batuhan", "away", { pointsEarned: 0 }),
          ],
        },
        {
          label: "SüperLig 5.Hafta",
          matches: [bonus],
          picks: [
            pick("b1", "a", "Karahan", "home", { pointsEarned: 6 }),
            pick("b1", "b", "Batuhan", "home", { pointsEarned: 6 }),
          ],
        },
      ],
    });
    expect(card?.headline).toBe("Herkes Fenerbahçe dedi.");
    expect(card?.chips.some((chip) => chip.label === "Bonus")).toBe(true);
  });
});

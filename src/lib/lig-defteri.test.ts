import { describe, expect, it } from "vitest";
import {
  buildLigDefteri,
  composeLigDefteriEntries,
  defaultLigDefteriSettings,
  listLigDefteriStories,
  parseLigDefteriSettings,
  type DefteriMatch,
  type DefteriPick,
  type LigDefteriSlot,
} from "@/lib/lig-defteri";

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

function autoSlots(count: number): LigDefteriSlot[] {
  return Array.from({ length: count }, () => ({
    mode: "auto" as const,
    autoStoryId: null,
    kicker: "",
    headline: "",
    detail: "",
  }));
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
    expect(card?.entries[0]?.kicker).toBe("Bu hafta");
    expect(card?.entries[0]?.headline).toBe("Herkes Fenerbahçe dedi.");
    expect(card?.entries[0]?.detail).toBe("Fenerbahçe–Eyüpspor");
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
    expect(card?.entries[0]?.headline).toBe("Sadece Emrah Amed dedi.");
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
    expect(card?.entries[0]?.kicker).toBe("5. hafta");
    expect(card?.entries[0]?.headline).toBe("Kimse Göztepe dememişti.");
  });

  it("fills up to five entries from season leftovers", () => {
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
      standings: [
        {
          playerName: "Karahan",
          totalPoints: 40,
          correctResultCount: 8,
          correctGoalsCount: 6,
          derbyCorrectCount: 2,
          perfectPredictionCount: 4,
        },
      ],
    });
    expect(card?.entries).toHaveLength(5);
    expect(card?.entries.some((entry) => entry.headline.includes("Bonus"))).toBe(
      true,
    );
  });
});

describe("composeLigDefteriEntries", () => {
  it("lets a custom slot replace an auto line", () => {
    const stories = listLigDefteriStories({
      currentWeekLabel: "SüperLig 6.Hafta",
      currentMatches: [match("m1", "Fenerbahçe", "Eyüpspor")],
      currentPicks: [
        pick("m1", "a", "Karahan", "home"),
        pick("m1", "b", "Batuhan", "home"),
        pick("m1", "c", "Buğra", "home"),
      ],
      scoredWeeks: [],
    });
    const settings = defaultLigDefteriSettings();
    settings.slots[0] = {
      mode: "custom",
      autoStoryId: null,
      kicker: "Not",
      headline: "Bu hafta bonus Göztepe.",
      detail: "",
    };
    const entries = composeLigDefteriEntries(stories, settings);
    expect(entries[0]?.headline).toBe("Bu hafta bonus Göztepe.");
  });

  it("pins a chosen auto story into a slot", () => {
    const stories = [
      {
        id: "a",
        priority: 10,
        kicker: "A",
        headline: "Bir",
        detail: null,
      },
      {
        id: "b",
        priority: 20,
        kicker: "B",
        headline: "İki",
        detail: null,
      },
    ];
    const slots = autoSlots(5);
    slots[0] = { ...slots[0], autoStoryId: "b" };
    const entries = composeLigDefteriEntries(stories, { slots });
    expect(entries[0]?.id).toBe("b");
    expect(entries[1]?.id).toBe("a");
  });
});

describe("parseLigDefteriSettings", () => {
  it("falls back to five auto slots", () => {
    const parsed = parseLigDefteriSettings({ slots: [{ mode: "custom" }] });
    expect(parsed.slots).toHaveLength(5);
    expect(parsed.slots[0]?.mode).toBe("custom");
    expect(parsed.slots[1]?.mode).toBe("auto");
  });
});

import { describe, expect, it } from "vitest";
import { latestWeekKingIds, type WeekKingRow } from "@/lib/data";

function kingRow(
  weekId: string,
  kings: { playerId: string; displayName: string }[],
): WeekKingRow {
  return {
    weekId,
    weekLabel: weekId,
    points: 12,
    kings: kings.map((king) => ({ ...king, slug: king.playerId })),
  };
}

describe("latestWeekKingIds", () => {
  it("returns an empty list when no week has been scored", () => {
    expect(latestWeekKingIds([])).toEqual([]);
  });

  it("uses the latest scored week, including ties", () => {
    const rows = [
      kingRow("w1", [{ playerId: "karahan", displayName: "Karahan" }]),
      kingRow("w2", [
        { playerId: "batuhan", displayName: "Batuhan" },
        { playerId: "kaan", displayName: "Kaan" },
      ]),
    ];
    expect(latestWeekKingIds(rows)).toEqual(["batuhan", "kaan"]);
  });
});

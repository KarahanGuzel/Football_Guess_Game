import { describe, expect, it } from "vitest";
import type { StandingsProgress } from "@/lib/data";
import type { StandingRow } from "@/types/database";
import {
  attachStandingsRankChanges,
  formatRankChange,
  rankChangeLabel,
  ranksByPoints,
  standingsRankChanges,
} from "@/lib/standings-rank";

function standing(
  playerId: string,
  displayName: string,
  totalPoints: number,
): StandingRow {
  return {
    player_id: playerId,
    display_name: displayName,
    slug: playerId,
    total_points: totalPoints,
    weeks_played: 2,
    correct_result_count: 0,
    correct_goals_count: 0,
    perfect_prediction_count: 0,
    derby_correct_count: 0,
    scored_prediction_count: 0,
    success_percentage: 0,
  };
}

function progress(
  totals: Record<string, number[]>,
  names: Record<string, string> = {},
): StandingsProgress {
  const weekCount = Math.max(...Object.values(totals).map((list) => list.length), 0);
  return {
    weeks: Array.from({ length: weekCount }, (_, index) => ({
      id: `w${index + 1}`,
      label: `Hafta ${index + 1}`,
    })),
    series: Object.entries(totals).map(([playerId, playerTotals]) => ({
      playerId,
      displayName: names[playerId] ?? playerId,
      slug: playerId,
      totals: playerTotals,
    })),
  };
}

describe("ranksByPoints", () => {
  it("ranks higher totals first and breaks ties by name", () => {
    const ranks = ranksByPoints([
      { playerId: "b", displayName: "Barış", total: 10 },
      { playerId: "a", displayName: "Ada", total: 10 },
      { playerId: "c", displayName: "Cem", total: 14 },
    ]);
    expect(ranks.get("c")).toBe(1);
    expect(ranks.get("a")).toBe(2);
    expect(ranks.get("b")).toBe(3);
  });
});

describe("standingsRankChanges", () => {
  it("is empty until a second week has been scored", () => {
    const rows = [standing("ada", "Ada", 8), standing("cem", "Cem", 4)];
    const changes = standingsRankChanges(rows, progress({ ada: [8], cem: [4] }));
    expect(changes.get("ada")).toBeNull();
    expect(changes.get("cem")).toBeNull();
  });

  it("shows green climbs and red drops against last week's table", () => {
    const rows = [
      standing("cem", "Cem", 18),
      standing("ada", "Ada", 12),
      standing("baris", "Barış", 10),
    ];
    const changes = standingsRankChanges(
      rows,
      progress({
        ada: [10, 12],
        cem: [4, 18],
        baris: [8, 10],
      }),
    );
    // Week 1: Ada 1, Barış 2, Cem 3 → now Cem 1, Ada 2, Barış 3
    expect(changes.get("cem")).toBe(2);
    expect(changes.get("ada")).toBe(-1);
    expect(changes.get("baris")).toBe(-1);
  });

  it("marks an unchanged place as zero", () => {
    const rows = [
      standing("ada", "Ada", 16),
      standing("cem", "Cem", 8),
    ];
    const changes = standingsRankChanges(
      rows,
      progress({
        ada: [10, 16],
        cem: [4, 8],
      }),
    );
    expect(changes.get("ada")).toBe(0);
    expect(changes.get("cem")).toBe(0);
  });

  it("uses the visible table order as the current rank", () => {
    const rows = [
      standing("baris", "Barış", 12),
      standing("ada", "Ada", 12),
    ];
    const changes = standingsRankChanges(
      rows,
      progress({
        ada: [10, 12],
        baris: [6, 12],
      }),
    );
    // Week 1 Ada was 1st; she is 2nd in today's table → -1
    expect(changes.get("ada")).toBe(-1);
    expect(changes.get("baris")).toBe(1);
  });
});

describe("attachStandingsRankChanges", () => {
  it("writes rank_change onto each standing row", () => {
    const rows = attachStandingsRankChanges(
      [standing("cem", "Cem", 18), standing("ada", "Ada", 12)],
      progress({ ada: [10, 12], cem: [4, 18] }),
    );
    expect(rows[0].rank_change).toBe(1);
    expect(rows[1].rank_change).toBe(-1);
  });
});

describe("formatRankChange", () => {
  it("keeps a plus on climbs", () => {
    expect(formatRankChange(2)).toBe("+2");
    expect(formatRankChange(-3)).toBe("-3");
  });
});

describe("rankChangeLabel", () => {
  it("describes the move in Turkish", () => {
    expect(rankChangeLabel(2)).toBe("Geçen haftaya göre 2 sıra yükseldi");
    expect(rankChangeLabel(-1)).toBe("Geçen haftaya göre 1 sıra düştü");
    expect(rankChangeLabel(0)).toBe("Geçen haftaya göre sıra değişmedi");
  });
});

import type { StandingsProgress } from "@/lib/data";
import type { StandingRow } from "@/types/database";

export type RankablePlayer = {
  playerId: string;
  displayName: string;
  total: number;
};

/** 1-based ranks: more points first, then Turkish name order. */
export function ranksByPoints(players: RankablePlayer[]): Map<string, number> {
  const sorted = [...players].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.displayName.localeCompare(b.displayName, "tr");
  });
  return new Map(sorted.map((player, index) => [player.playerId, index + 1]));
}

export function formatRankChange(change: number): string {
  return change > 0 ? `+${change}` : String(change);
}

export function rankChangeLabel(change: number): string {
  if (change > 0) return `Geçen haftaya göre ${change} sıra yükseldi`;
  if (change < 0) return `Geçen haftaya göre ${Math.abs(change)} sıra düştü`;
  return "Geçen haftaya göre sıra değişmedi";
}

/**
 * Position delta vs the previous scored week.
 * Positive = climbed (e.g. 4th → 2nd is +2).
 * Null until at least two weeks have been scored.
 */
export function standingsRankChanges(
  rows: StandingRow[],
  progress: StandingsProgress,
): Map<string, number | null> {
  const changes = new Map<string, number | null>();

  if (progress.weeks.length < 2) {
    for (const row of rows) changes.set(row.player_id, null);
    return changes;
  }

  const previousIndex = progress.weeks.length - 2;
  const previousRanks = ranksByPoints(
    progress.series.map((series) => ({
      playerId: series.playerId,
      displayName: series.displayName,
      total: series.totals[previousIndex] ?? 0,
    })),
  );

  rows.forEach((row, index) => {
    const previous = previousRanks.get(row.player_id);
    if (previous == null) {
      changes.set(row.player_id, null);
      return;
    }
    changes.set(row.player_id, previous - (index + 1));
  });

  return changes;
}

export function attachStandingsRankChanges(
  rows: StandingRow[],
  progress: StandingsProgress,
): StandingRow[] {
  const changes = standingsRankChanges(rows, progress);
  return rows.map((row) => ({
    ...row,
    rank_change: changes.get(row.player_id) ?? null,
  }));
}

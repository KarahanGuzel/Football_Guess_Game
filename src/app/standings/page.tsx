import { StandingsPointsChart } from "@/components/standings-points-chart";
import { StandingsTable } from "@/components/standings-table";
import { WeekKingsTable } from "@/components/week-kings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getSeasonLeaderIds,
  getStandings,
  getStandingsProgress,
  getWeekKings,
} from "@/lib/data";

export default async function StandingsPage() {
  await requirePlayer();

  let rows: Awaited<ReturnType<typeof getStandings>> = [];
  let weekKings: Awaited<ReturnType<typeof getWeekKings>> = [];
  let progress: Awaited<ReturnType<typeof getStandingsProgress>> = {
    weeks: [],
    series: [],
  };
  let errorMessage: string | null = null;

  try {
    [rows, weekKings, progress] = await Promise.all([
      getStandings(),
      getWeekKings(),
      getStandingsProgress(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Sıralama verisi alınamadı.";
  }

  const leaderIds = getSeasonLeaderIds(rows);

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Sıralama</h1>
        <p className="page-sub">Genel tablo, haftanın kralları ve sezon grafiği.</p>
      </header>

      {errorMessage ? (
        <p style={{ color: "var(--flash-error)" }}>{errorMessage}</p>
      ) : (
        <div className="standings-page-stack">
          <div className="standings-tables-grid">
            <div className="standings-page-block standings-page-table">
              <StandingsTable
                rows={rows}
                titled
                leaderIds={leaderIds}
              />
            </div>
            <div className="standings-page-block standings-page-kings">
              <WeekKingsTable rows={weekKings} leaderIds={leaderIds} />
            </div>
          </div>
          <div className="standings-page-block">
            <StandingsPointsChart data={progress} />
          </div>
        </div>
      )}
    </div>
  );
}

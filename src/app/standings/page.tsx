import { StandingsPointsChart } from "@/components/standings-points-chart";
import { StandingsTable } from "@/components/standings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import { getStandings, getStandingsProgress } from "@/lib/data";

export default async function StandingsPage() {
  await requirePlayer();

  let rows: Awaited<ReturnType<typeof getStandings>> = [];
  let progress: Awaited<ReturnType<typeof getStandingsProgress>> = {
    weeks: [],
    series: [],
  };
  let errorMessage: string | null = null;

  try {
    [rows, progress] = await Promise.all([getStandings(), getStandingsProgress()]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Sıralama verisi alınamadı.";
  }

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Sıralama</h1>
        <p className="page-sub">Lig tablosu ve haftalık puan grafiği.</p>
      </header>

      {errorMessage ? (
        <p style={{ color: "var(--flash-error)" }}>{errorMessage}</p>
      ) : (
        <div className="standings-page-stack">
          <div className="standings-page-block standings-page-table">
            <StandingsTable rows={rows} />
          </div>
          <div className="standings-page-block">
            <StandingsPointsChart data={progress} />
          </div>
        </div>
      )}
    </div>
  );
}

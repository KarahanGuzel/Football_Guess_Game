import Link from "next/link";
import { LockCountdown } from "@/components/lock-countdown";
import { PredictionForm } from "@/components/prediction-form";
import { StandingsTable } from "@/components/standings-table";
import { WeekKingsTable } from "@/components/week-kings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getCurrentPlayableWeek,
  getPredictionsForMatches,
  getPredictionsForPlayer,
  getStandings,
  getWeekKings,
  latestWeekKingIds,
} from "@/lib/data";

export default async function HomePage() {
  const player = await requirePlayer();

  let weekData: Awaited<ReturnType<typeof getCurrentPlayableWeek>> = null;
  let weekError: string | null = null;
  let standings: Awaited<ReturnType<typeof getStandings>> = [];
  let weekKings: Awaited<ReturnType<typeof getWeekKings>> = [];
  let standingsError: string | null = null;

  try {
    weekData = await getCurrentPlayableWeek();
  } catch (error) {
    weekError = error instanceof Error ? error.message : "Hafta yüklenemedi.";
  }

  try {
    [standings, weekKings] = await Promise.all([
      getStandings(),
      getWeekKings(),
    ]);
  } catch (error) {
    standingsError =
      error instanceof Error ? error.message : "Puan durumu alınamadı.";
  }

  const matchIds = weekData?.matches.map((m) => m.id) ?? [];
  const locked = weekData ? weekData.status !== "open" : true;
  const predictions =
    matchIds.length > 0
      ? await getPredictionsForPlayer(player.playerId, matchIds)
      : [];
  const weekPredictions =
    matchIds.length > 0
      ? await getPredictionsForMatches(matchIds)
      : [];

  const leaderIds = latestWeekKingIds(weekKings);

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Ana Sayfa</h1>
      </header>

      <section className="stack-md reveal">
        <div className="section-head week-head">
          <h2 className="section-title">
            {weekData ? weekData.week.label : "Bu Hafta"}
          </h2>
          {weekData ? (
            <LockCountdown
              lockAtIso={weekData.lockAt?.toISOString() ?? null}
              locked={locked}
            />
          ) : null}
        </div>

        {weekError ? (
          <p className="flash flash-error">{weekError}</p>
        ) : !weekData ? (
          <div className="panel muted">
            Şu an yayınlanmış bir tahmin haftası yok.
          </div>
        ) : weekData.matches.length === 0 ? (
          <div className="panel muted">Bu haftaya henüz maç eklenmemiş.</div>
        ) : (
          <PredictionForm
            weekId={weekData.week.id}
            matches={weekData.matches}
            initialPredictions={predictions}
            locked={locked}
            currentPlayerId={player.playerId}
            weekPredictions={weekPredictions}
          />
        )}
      </section>

      <section className="stack-md reveal">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 className="section-title">Lig özeti</h2>
          <Link href="/standings" className="text-link">
            Tümü →
          </Link>
        </div>

        {standingsError ? (
          <p className="flash flash-error">{standingsError}</p>
        ) : (
          <div className="home-rank-stack">
            <StandingsTable
              rows={standings}
              compact
              leaderIds={leaderIds}
            />
            <WeekKingsTable rows={weekKings} compact />
          </div>
        )}
      </section>
    </div>
  );
}

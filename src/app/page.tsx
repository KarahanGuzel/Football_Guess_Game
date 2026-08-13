import Link from "next/link";
import { LockCountdown } from "@/components/lock-countdown";
import { PredictionForm } from "@/components/prediction-form";
import { StandingsTable } from "@/components/standings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getCurrentPlayableWeek,
  getPredictionsForPlayer,
  getStandings,
} from "@/lib/data";

export default async function HomePage() {
  const player = await requirePlayer();

  let weekData: Awaited<ReturnType<typeof getCurrentPlayableWeek>> = null;
  let weekError: string | null = null;
  let standings: Awaited<ReturnType<typeof getStandings>> = [];
  let standingsError: string | null = null;

  try {
    weekData = await getCurrentPlayableWeek();
  } catch (error) {
    weekError = error instanceof Error ? error.message : "Hafta yüklenemedi.";
  }

  try {
    standings = await getStandings();
  } catch (error) {
    standingsError =
      error instanceof Error ? error.message : "Puan durumu alınamadı.";
  }

  const predictions =
    weekData && weekData.matches.length > 0
      ? await getPredictionsForPlayer(
          player.playerId,
          weekData.matches.map((m) => m.id),
        )
      : [];

  const locked = weekData ? weekData.status !== "open" : true;

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
          <p style={{ color: "var(--flash-error)" }}>{weekError}</p>
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
          />
        )}
      </section>

      <section className="stack-md reveal">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 className="section-title">Sıralama</h2>
          <Link href="/standings" className="muted" style={{ fontSize: "0.9rem" }}>
            Tümü →
          </Link>
        </div>

        {standingsError ? (
          <p style={{ color: "var(--flash-error)" }}>{standingsError}</p>
        ) : (
          <StandingsTable rows={standings} compact />
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { PredictionForm } from "@/components/prediction-form";
import { StandingsTable } from "@/components/standings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getCurrentPlayableWeek,
  getPredictionsForPlayer,
  getStandings,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";

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
        <p className="page-sub">Yayındaki haftanın maçları ve güncel puan durumu.</p>
      </header>

      <section className="stack-md reveal">
        <div>
          <h2 className="section-title">
            {weekData ? weekData.week.label : "Bu Hafta"}
          </h2>
          {weekData ? (
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              {locked
                ? "Tahminler kilitli."
                : "Tüm maçlar için sonuç ve alt/üst tahminini yap."}
              {weekData.lockAt ? (
                <>
                  {" "}
                  Kilit:{" "}
                  <strong>{formatDateTime(weekData.lockAt.toISOString())}</strong>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        {weekError ? (
          <p style={{ color: "#ffb4b4" }}>{weekError}</p>
        ) : !weekData ? (
          <div className="panel muted">
            Şu an yayınlanmış bir tahmin haftası yok. Yönetici haftayı yayınlayınca
            burada görünecek.
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
          <div>
            <h2 className="section-title">Puan Durumu</h2>
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              Güncel sıralama
            </p>
          </div>
          <Link href="/standings" className="muted" style={{ fontSize: "0.9rem" }}>
            Tüm istatistikler →
          </Link>
        </div>

        {standingsError ? (
          <p style={{ color: "#ffb4b4" }}>{standingsError}</p>
        ) : (
          <StandingsTable rows={standings} compact />
        )}
      </section>
    </div>
  );
}

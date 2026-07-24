import Link from "next/link";
import { PredictionsBoard } from "@/components/predictions-board";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getCurrentPlayableWeek,
  getMatchesForWeek,
  getPastWeeks,
  getPredictionsForMatches,
  listActivePlayers,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { weekLockAt } from "@/lib/week-lock";

export default async function PredictionsPage() {
  const player = await requirePlayer();

  const [playable, pastWeeks, players] = await Promise.all([
    getCurrentPlayableWeek(),
    getPastWeeks(),
    listActivePlayers(),
  ]);

  let focus = playable
    ? {
        week: playable.week,
        matches: playable.matches,
        lockAt: playable.lockAt,
        status: playable.status as "open" | "locked" | "scored",
      }
    : null;

  if (!focus) {
    const latest = pastWeeks[0];
    if (latest) {
      const matches = await getMatchesForWeek(latest.id);
      focus = {
        week: latest,
        matches,
        lockAt: weekLockAt(matches),
        status: latest.status === "scored" ? "scored" : "locked",
      };
    }
  }

  const predictions =
    focus && focus.matches.length > 0
      ? await getPredictionsForMatches(focus.matches.map((m) => m.id))
      : [];

  const revealPicks = focus ? focus.status !== "open" : false;
  const historyWeeks = pastWeeks.filter((w) => w.id !== focus?.week.id);

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Tahminler</h1>
        <p className="page-sub">
          Kilit sonrası herkesin tahminlerini oyuncu oyuncu karşılaştır. Hafta
          açıkken sadece kimlerin kaydettiğini görürsün.
        </p>
      </header>

      {!focus ? (
        <div className="panel muted reveal">
          Henüz karşılaştırılacak bir tahmin haftası yok.
        </div>
      ) : (
        <section className="stack-md">
          <div>
            <h2 className="section-title">{focus.week.label}</h2>
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              {revealPicks
                ? "Tahminler açık — herkesin seçimleri aşağıda."
                : "Tahminler henüz kilitli değil."}
              {focus.lockAt ? (
                <>
                  {" "}
                  Kilit:{" "}
                  <strong>{formatDateTime(focus.lockAt.toISOString())}</strong>
                </>
              ) : null}
            </p>
          </div>

          {focus.matches.length === 0 ? (
            <div className="panel muted">Bu haftaya henüz maç eklenmemiş.</div>
          ) : (
            <PredictionsBoard
              matches={focus.matches}
              predictions={predictions}
              players={players}
              revealPicks={revealPicks}
              currentPlayerId={player.playerId}
            />
          )}
        </section>
      )}

      {historyWeeks.length > 0 ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Geçmiş haftalar</h2>
          </div>
          <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.9rem" }}>
            Eski haftaların maç bazlı karşılaştırması Geçmiş’te.
          </p>
          <div className="stack-xs">
            {historyWeeks.map((week) => (
              <Link key={week.id} href={`/history/${week.id}`} className="week-row">
                <div className="week-row-main">
                  <span className="week-row-title">{week.label}</span>
                  <span className={`status-chip status-${week.status}`}>
                    {week.status === "scored" ? "Puanlandı" : "Kilitli"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

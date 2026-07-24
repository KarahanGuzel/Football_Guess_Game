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
import { weekLockAt } from "@/lib/week-lock";

export default async function PredictionsPage() {
  await requirePlayer();

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

  const historyWeeks = pastWeeks.filter((w) => w.id !== focus?.week.id);

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Tahminler</h1>
      </header>

      {!focus ? (
        <div className="panel muted reveal">
          Henüz karşılaştırılacak bir tahmin haftası yok.
        </div>
      ) : (
        <section className="stack-md">
          <h2 className="section-title">{focus.week.label}</h2>

          {focus.matches.length === 0 ? (
            <div className="panel muted">Bu haftaya henüz maç eklenmemiş.</div>
          ) : (
            <PredictionsBoard
              matches={focus.matches}
              predictions={predictions}
              players={players}
            />
          )}
        </section>
      )}

      {historyWeeks.length > 0 ? (
        <section className="panel reveal past-weeks-panel">
          <div className="section-head">
            <h2 className="section-title">Geçmiş haftalar</h2>
            <span className="past-weeks-count">{historyWeeks.length}</span>
          </div>
          <div className="past-weeks-list">
            {historyWeeks.map((week) => (
              <Link
                key={week.id}
                href={`/history/${week.id}`}
                className="past-week-card"
              >
                <span className="past-week-card-main">
                  <span className="past-week-label">{week.label}</span>
                </span>
                <span className="past-week-card-side">
                  <span className={`status-chip status-${week.status}`}>
                    {week.status === "scored" ? "Puanlandı" : "Kilitli"}
                  </span>
                  <span className="past-week-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

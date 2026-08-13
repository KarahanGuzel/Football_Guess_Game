import { PastWeeksAccordion } from "@/components/past-weeks-accordion";
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
import type { Player, Prediction } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

function buildWeekPointRows(
  players: Player[],
  predictions: PredictionWithPlayer[],
) {
  const totals = new Map<
    string,
    { player: Player; points: number; hasPicks: boolean; scoredAny: boolean }
  >();

  for (const player of players) {
    totals.set(player.id, {
      player,
      points: 0,
      hasPicks: false,
      scoredAny: false,
    });
  }

  for (const prediction of predictions) {
    let bucket = totals.get(prediction.player_id);
    if (!bucket) {
      bucket = {
        player: prediction.player,
        points: 0,
        hasPicks: false,
        scoredAny: false,
      };
      totals.set(prediction.player_id, bucket);
    }
    bucket.hasPicks = true;
    if (prediction.points_earned !== null) {
      bucket.scoredAny = true;
      bucket.points += prediction.points_earned;
    }
  }

  return [...totals.values()]
    .filter((row) => row.hasPicks)
    .map((row) => ({
      player: row.player,
      points: row.scoredAny ? row.points : null,
      hasPicks: row.hasPicks,
    }))
    .sort((a, b) => {
      const ap = a.points ?? -1;
      const bp = b.points ?? -1;
      if (bp !== ap) return bp - ap;
      return a.player.display_name.localeCompare(b.player.display_name, "tr");
    });
}

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

  const historySummaries = await Promise.all(
    historyWeeks.map(async (week) => {
      const matches = await getMatchesForWeek(week.id);
      const weekPredictions = await getPredictionsForMatches(
        matches.map((m) => m.id),
      );
      return {
        week,
        rows: buildWeekPointRows(players, weekPredictions),
      };
    }),
  );

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

      {historySummaries.length > 0 ? (
        <section className="panel reveal past-weeks-panel">
          <div className="section-head">
            <h2 className="section-title">Geçmiş haftalar</h2>
            <span className="past-weeks-count">{historySummaries.length}</span>
          </div>
          <PastWeeksAccordion weeks={historySummaries} />
        </section>
      ) : null}
    </div>
  );
}

import { BonusBadge, DerbyBadge } from "@/components/badges";
import { FanFlag } from "@/components/fan-flag";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import { goalsLabel, resultLabel } from "@/lib/prediction-labels";
import type { MatchWithTeams, Player, Prediction } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

export function HistoryWeekContent({
  matches,
  predictions,
}: {
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
}) {
  if (matches.length === 0) {
    return <p className="muted history-week-empty">Bu haftaya maç eklenmemiş.</p>;
  }

  return (
    <div className="history-week-body">
      {matches.map((match) => {
        const matchPredictions = predictions
          .filter((p) => p.match_id === match.id)
          .sort((a, b) =>
            a.player.display_name.localeCompare(b.player.display_name, "tr"),
          );

        return (
          <section key={match.id} className="history-match-card">
            <div className="history-match-head">
              <div>
                <div className="history-match-teams">
                  <MatchTeamsLine match={match} showScores size={13} />
                </div>
                <div className="muted history-match-kickoff">
                  {formatKickoff(match.kickoff_at)}
                </div>
              </div>
              <div className="history-match-badges">
                {match.is_bonus ? <BonusBadge compact /> : null}
                {match.is_derby ? <DerbyBadge compact /> : null}
              </div>
            </div>

            <div className="history-picks-wrap">
              <table className="history-picks-table">
                <thead>
                  <tr>
                    <th>Oyuncu</th>
                    <th>Sonuç</th>
                    <th>A/Ü</th>
                    <th>Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {matchPredictions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">
                        Tahmin yok.
                      </td>
                    </tr>
                  ) : (
                    matchPredictions.map((prediction) => (
                      <tr key={prediction.id}>
                        <td>
                          <span className="history-player">
                            <FanFlag
                              slug={prediction.player.slug}
                              displayName={prediction.player.display_name}
                              size={11}
                            />
                            {prediction.player.display_name}
                          </span>
                        </td>
                        <td>{resultLabel[prediction.result]}</td>
                        <td>{goalsLabel[prediction.goals_market]}</td>
                        <td className="history-points">
                          {prediction.points_earned ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

import { BonusBadge, DerbyBadge } from "@/components/badges";
import { FanFlag } from "@/components/fan-flag";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { MatchWithTeams, Player, Prediction } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

export function PredictionsBoard({
  matches,
  predictions,
  players,
}: {
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
  players: Player[];
}) {
  const matchIds = new Set(matches.map((m) => m.id));
  const requiredCount = matches.length;

  const byPlayer = new Map<
    string,
    { player: Player; picks: PredictionWithPlayer[] }
  >();

  for (const player of players) {
    byPlayer.set(player.id, { player, picks: [] });
  }

  for (const prediction of predictions) {
    if (!matchIds.has(prediction.match_id)) continue;
    const bucket = byPlayer.get(prediction.player_id);
    if (!bucket) {
      byPlayer.set(prediction.player_id, {
        player: prediction.player,
        picks: [prediction],
      });
      continue;
    }
    bucket.picks.push(prediction);
  }

  const rows = [...byPlayer.values()]
    .map((row) => ({
      ...row,
      complete: requiredCount > 0 && row.picks.length >= requiredCount,
    }))
    .sort((a, b) => {
      if (a.complete !== b.complete) return a.complete ? -1 : 1;
      return a.player.display_name.localeCompare(b.player.display_name, "tr");
    });

  const submittedCount = rows.filter((r) => r.complete).length;
  const withPicks = rows.filter((r) => r.picks.length > 0);
  const matchById = new Map(matches.map((m) => [m.id, m]));

  return (
    <div className="stack-md predictions-compare">
      <section className="panel reveal predictions-status">
        <div className="section-head">
          <h2 className="section-title">Kim doldurdu?</h2>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {submittedCount}/{players.length}
          </span>
        </div>
        <ul className="submission-list">
          {rows.map(({ player, complete }) => (
            <li key={player.id} className="submission-row">
              <span className="submission-player">
                <FanFlag slug={player.slug} displayName={player.display_name} size={12} />
                {player.display_name}
              </span>
              <span className={complete ? "status-dot status-dot-ok" : "status-dot"}>
                {complete ? "Kaydetti" : "Bekleniyor"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {withPicks.length === 0 ? (
        <div className="panel muted reveal">Bu hafta henüz kayıtlı tahmin yok.</div>
      ) : (
        withPicks.map(({ player, picks }) => {
          const ordered = matches
            .map((match) => picks.find((p) => p.match_id === match.id))
            .filter((p): p is PredictionWithPlayer => Boolean(p));

          const weekPoints = ordered.reduce(
            (sum, p) => sum + (p.points_earned ?? 0),
            0,
          );
          const scored = ordered.some((p) => p.points_earned !== null);

          return (
            <section key={player.id} className="panel reveal player-picks-card">
              <div className="section-head" style={{ marginBottom: "0.65rem" }}>
                <h2
                  className="section-title"
                  style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}
                >
                  <FanFlag
                    slug={player.slug}
                    displayName={player.display_name}
                    size={14}
                  />
                  {player.display_name}
                </h2>
                {scored ? (
                  <span className="week-points-pill">{weekPoints} puan</span>
                ) : (
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    {ordered.length}/{requiredCount} maç
                  </span>
                )}
              </div>

              <ul className="player-pick-list">
                {ordered.map((prediction) => {
                  const match = matchById.get(prediction.match_id);
                  if (!match) return null;
                  return (
                    <li key={prediction.id} className="player-pick-row">
                      <div className="player-pick-match">
                        <MatchTeamsLine match={match} size={12} />
                        <div className="muted" style={{ fontSize: "0.78rem", marginTop: 2 }}>
                          {formatKickoff(match.kickoff_at)}
                          {match.is_bonus ? (
                            <>
                              {" "}
                              <BonusBadge />
                            </>
                          ) : null}
                          {match.is_derby ? (
                            <>
                              {" "}
                              <DerbyBadge />
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="player-pick-values">
                        <span className="pick-pill">
                          {resultLabelForMatch(
                            prediction.result,
                            match.home_team.short_name,
                            match.away_team.short_name,
                          )}
                        </span>
                        <span className="pick-pill">
                          {goalsLabel[prediction.goals_market]}
                        </span>
                        <span
                          className={
                            prediction.points_earned != null
                              ? "pick-points"
                              : "pick-points muted"
                          }
                        >
                          {prediction.points_earned != null
                            ? `+${prediction.points_earned}`
                            : "—"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

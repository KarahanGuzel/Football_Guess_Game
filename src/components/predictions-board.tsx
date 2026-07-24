"use client";

import { useMemo, useState } from "react";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { FanFlag } from "@/components/fan-flag";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { MatchWithTeams, Player, Prediction } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

type PlayerRow = {
  player: Player;
  picks: PredictionWithPlayer[];
  complete: boolean;
};

export function PredictionsBoard({
  matches,
  predictions,
  players,
}: {
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
  players: Player[];
}) {
  const [openPlayerIds, setOpenPlayerIds] = useState<Set<string>>(() => new Set());

  const { rows, submittedCount, matchById } = useMemo(() => {
    const matchIds = new Set(matches.map((m) => m.id));
    const requiredCount = matches.length;
    const byPlayer = new Map<string, { player: Player; picks: PredictionWithPlayer[] }>();

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

    const nextRows: PlayerRow[] = [...byPlayer.values()]
      .map((row) => ({
        ...row,
        complete: requiredCount > 0 && row.picks.length >= requiredCount,
      }))
      .sort((a, b) => {
        if (a.complete !== b.complete) return a.complete ? -1 : 1;
        return a.player.display_name.localeCompare(b.player.display_name, "tr");
      });

    return {
      rows: nextRows,
      submittedCount: nextRows.filter((r) => r.complete).length,
      matchById: new Map(matches.map((m) => [m.id, m])),
    };
  }, [matches, predictions, players]);

  function togglePlayer(playerId: string, hasPicks: boolean) {
    if (!hasPicks) return;
    setOpenPlayerIds((current) => {
      const next = new Set(current);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  return (
    <section className="panel reveal predictions-status">
      <div className="section-head">
        <h2 className="section-title">Tahminler</h2>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          {submittedCount}/{players.length}
        </span>
      </div>
      <p className="muted predictions-hint">
        Tahmini olan isme dokununca maç seçimleri açılır.
      </p>

      <ul className="submission-list">
        {rows.map(({ player, complete, picks }) => {
          const hasPicks = picks.length > 0;
          const isOpen = openPlayerIds.has(player.id);
          const ordered = hasPicks
            ? matches
                .map((match) => picks.find((p) => p.match_id === match.id))
                .filter((p): p is PredictionWithPlayer => Boolean(p))
            : [];
          const weekPoints = ordered.reduce(
            (sum, p) => sum + (p.points_earned ?? 0),
            0,
          );
          const scored = ordered.some((p) => p.points_earned !== null);

          return (
            <li
              key={player.id}
              className={`submission-item${isOpen ? " submission-item-open" : ""}${
                hasPicks ? " submission-item-clickable" : ""
              }`}
            >
              <button
                type="button"
                className="submission-row-btn"
                onClick={() => togglePlayer(player.id, hasPicks)}
                disabled={!hasPicks}
                aria-expanded={hasPicks ? isOpen : undefined}
              >
                <span className="submission-player">
                  <FanFlag slug={player.slug} displayName={player.display_name} size={12} />
                  {player.display_name}
                  {hasPicks ? (
                    <span
                      className={`submission-chevron${isOpen ? " submission-chevron-open" : ""}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
                      </svg>
                    </span>
                  ) : null}
                </span>
                <span className={complete ? "status-dot status-dot-ok" : "status-dot"}>
                  {complete ? "Kaydetti" : "Bekleniyor"}
                </span>
              </button>

              {isOpen && hasPicks ? (
                <div className="player-picks-drawer">
                  {scored ? (
                    <div className="player-picks-drawer-meta">
                      <span className="week-points-pill">{weekPoints} puan</span>
                    </div>
                  ) : null}
                  <div className="player-picks-table-wrap">
                    <table className="player-picks-table">
                      <thead>
                        <tr>
                          <th>Maç</th>
                          <th>Sonuç</th>
                          <th>A/Ü</th>
                          <th>Puan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordered.map((prediction) => {
                          const match = matchById.get(prediction.match_id);
                          if (!match) return null;
                          return (
                            <tr key={prediction.id}>
                              <td>
                                <div className="player-picks-match">
                                  <MatchTeamsLine match={match} size={11} />
                                  {match.is_bonus ? <BonusBadge compact /> : null}
                                  {match.is_derby ? <DerbyBadge compact /> : null}
                                </div>
                              </td>
                              <td>
                                {resultLabelForMatch(
                                  prediction.result,
                                  match.home_team.short_name,
                                  match.away_team.short_name,
                                )}
                              </td>
                              <td>{goalsLabel[prediction.goals_market]}</td>
                              <td className="player-picks-points">
                                {prediction.points_earned != null
                                  ? `+${prediction.points_earned}`
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

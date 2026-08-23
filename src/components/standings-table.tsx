import { PlayerChip } from "@/components/player-chip";
import { RankMedal } from "@/components/rank-medal";
import { formatRankChange, rankChangeLabel } from "@/lib/standings-rank";
import type { StandingRow } from "@/types/database";

function RankDelta({ change }: { change?: number | null }) {
  if (change == null || change === 0) return null;
  const up = change > 0;
  const label = rankChangeLabel(change);
  return (
    <span
      className={`standings-rank-delta ${
        up ? "standings-rank-delta-up" : "standings-rank-delta-down"
      }`}
      title={label}
      aria-label={label}
    >
      {formatRankChange(change)}
    </span>
  );
}

export function StandingsTable({
  rows,
  compact = false,
  titled = false,
  leaderIds,
}: {
  rows: StandingRow[];
  compact?: boolean;
  /** Show "Genel sıralama" section header (standings page). */
  titled?: boolean;
  /** Week-king ids for crown. Defaults from season standings if omitted. */
  leaderIds?: string[];
}) {
  const colCount = compact ? 6 : 9;
  const leaders = new Set(leaderIds ?? []);

  return (
    <div className={`panel standings-panel${titled ? " standings-panel-titled" : ""}`}>
      {titled ? (
        <div className="standings-panel-head">
          <h2 className="section-title">Genel sıralama</h2>
          <p className="muted standings-panel-sub">
            Toplam puan, isabet özeti ve geçen haftaya göre sıra
          </p>
        </div>
      ) : null}

      <div className="standings-scroll">
        <table className={`standings-table${compact ? " standings-table-compact" : ""}`}>
          <thead>
            <tr>
              <th scope="col" className="standings-col-rank">
                <span className="standings-th-main">Sıra</span>
              </th>
              <th scope="col" className="standings-col-player">
                <span className="standings-th-main">Oyuncu</span>
              </th>
              <th scope="col" className="standings-col-num">
                <span className="standings-th-main">Puan</span>
                <span className="standings-th-sub">toplam</span>
              </th>
              <th scope="col" className="standings-col-num">
                <span className="standings-th-main">Hafta</span>
                <span className="standings-th-sub">oynanan</span>
              </th>
              {!compact ? (
                <>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Taraf</span>
                    <span className="standings-th-sub">doğru</span>
                  </th>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Alt/Üst</span>
                    <span className="standings-th-sub">doğru</span>
                  </th>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Strike</span>
                    <span className="standings-th-sub">tam isabet</span>
                  </th>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Derbi</span>
                    <span className="standings-th-sub">strike</span>
                  </th>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Oran</span>
                    <span className="standings-th-sub">isabet %</span>
                  </th>
                </>
              ) : (
                <>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Strike</span>
                  </th>
                  <th scope="col" className="standings-col-num">
                    <span className="standings-th-main">Oran</span>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="muted standings-empty">
                  Henüz hesaplanmış tahmin yok.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const rank = index + 1;
                const podium =
                  rank <= 3 ? `standings-row-top standings-row-top${rank}` : "";
                return (
                  <tr key={row.player_id} className={podium}>
                    <td className="standings-rank-cell">
                      {rank <= 3 ? (
                        <RankMedal rank={rank} />
                      ) : (
                        <span className="standings-rank-num">{rank}</span>
                      )}
                    </td>
                    <td className="standings-player-cell">
                      <span className="standings-player-wrap">
                        <PlayerChip
                          slug={row.slug}
                          displayName={row.display_name}
                          size={compact ? 12 : 13}
                          crowned={leaders.has(row.player_id)}
                          className="standings-player"
                        />
                        <RankDelta change={row.rank_change} />
                      </span>
                    </td>
                    <td className="standings-col-num standings-points">
                      {row.total_points}
                    </td>
                    <td className="standings-col-num">
                      <span className="standings-stat">{row.weeks_played ?? 0}</span>
                    </td>
                    {!compact ? (
                      <>
                        <td className="standings-col-num">
                          <span className="standings-stat">
                            {row.correct_result_count}
                          </span>
                        </td>
                        <td className="standings-col-num">
                          <span className="standings-stat">
                            {row.correct_goals_count}
                          </span>
                        </td>
                        <td className="standings-col-num">
                          <span className="standings-stat standings-stat-strike">
                            {row.perfect_prediction_count}
                          </span>
                        </td>
                        <td className="standings-col-num">
                          <span className="standings-stat standings-stat-derby">
                            {row.derby_correct_count ?? 0}
                          </span>
                        </td>
                        <td className="standings-col-num">
                          <span className="standings-stat standings-stat-rate">
                            {Number(row.success_percentage).toFixed(1)}%
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="standings-col-num">
                          <span className="standings-stat standings-stat-strike">
                            {row.perfect_prediction_count}
                          </span>
                        </td>
                        <td className="standings-col-num">
                          <span className="standings-stat standings-stat-rate">
                            {Number(row.success_percentage).toFixed(1)}%
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!compact && rows.length > 0 ? (
        <p className="standings-legend muted">
          Taç = son puanlanan haftanın kralı · +/− = geçen haftaya göre sıra · Taraf = maç
          sonucu · Alt/Üst = 2.5 · Strike = ikisi birden · Derbi = derbide strike · Oran =
          strike / puanlanan maç
        </p>
      ) : null}
    </div>
  );
}

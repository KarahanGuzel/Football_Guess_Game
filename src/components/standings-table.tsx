import { FanFlag } from "@/components/fan-flag";
import { RankMedal } from "@/components/rank-medal";
import type { StandingRow } from "@/types/database";

function missRate(row: StandingRow) {
  if (row.scored_prediction_count <= 0) return 0;
  const misses = Math.max(
    0,
    row.scored_prediction_count - row.perfect_prediction_count,
  );
  return (100 * misses) / row.scored_prediction_count;
}

export function StandingsTable({
  rows,
  compact = false,
  titled = false,
}: {
  rows: StandingRow[];
  compact?: boolean;
  /** Show "Genel sıralama" section header (standings page). */
  titled?: boolean;
}) {
  return (
    <div className={`panel standings-panel${titled ? " standings-panel-titled" : ""}`}>
      {titled ? (
        <div className="standings-panel-head">
          <h2 className="section-title">Genel sıralama</h2>
          <p className="muted standings-panel-sub">
            Toplam puan ve isabet özeti
          </p>
        </div>
      ) : null}

      <div className="standings-scroll">
        <table className={`standings-table${compact ? " standings-table-compact" : ""}`}>
          <thead>
            <tr>
              <th scope="col">
                <span className="standings-th-main">Sıra</span>
              </th>
              <th scope="col">
                <span className="standings-th-main">Oyuncu</span>
              </th>
              <th scope="col">
                <span className="standings-th-main">Puan</span>
                <span className="standings-th-sub">toplam</span>
              </th>
              {!compact ? (
                <>
                  <th scope="col">
                    <span className="standings-th-main">Sonuç</span>
                    <span className="standings-th-sub">doğru MS</span>
                  </th>
                  <th scope="col">
                    <span className="standings-th-main">Alt/Üst</span>
                    <span className="standings-th-sub">doğru 2.5</span>
                  </th>
                  <th scope="col">
                    <span className="standings-th-main">Çift</span>
                    <span className="standings-th-sub">tam isabet</span>
                  </th>
                  <th scope="col">
                    <span className="standings-th-main">Maç</span>
                    <span className="standings-th-sub">puanlanan</span>
                  </th>
                  <th scope="col">
                    <span className="standings-th-main">İsabet</span>
                    <span className="standings-th-sub">çift oran</span>
                  </th>
                </>
              ) : (
                <>
                  <th scope="col">
                    <span className="standings-th-main">Çift</span>
                    <span className="standings-th-sub">isabet</span>
                  </th>
                  <th scope="col">
                    <span className="standings-th-main">İsabet</span>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={compact ? 5 : 8}
                  className="muted standings-empty"
                >
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
                      <span className="standings-player">
                        <FanFlag
                          slug={row.slug}
                          displayName={row.display_name}
                          size={13}
                        />
                        {row.display_name}
                      </span>
                    </td>
                    <td className="standings-points">{row.total_points}</td>
                    {!compact ? (
                      <>
                        <td>
                          <span className="standings-stat">
                            {row.correct_result_count}
                          </span>
                        </td>
                        <td>
                          <span className="standings-stat">
                            {row.correct_goals_count}
                          </span>
                        </td>
                        <td>
                          <span className="standings-stat standings-stat-strong">
                            {row.perfect_prediction_count}
                          </span>
                        </td>
                        <td>
                          <span className="standings-stat muted">
                            {row.scored_prediction_count}
                          </span>
                        </td>
                        <td>
                          <span className="standings-stat">
                            {Number(row.success_percentage).toFixed(1)}%
                          </span>
                          <span className="standings-miss-hint muted">
                            kaçan {missRate(row).toFixed(0)}%
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className="standings-stat standings-stat-strong">
                            {row.perfect_prediction_count}
                          </span>
                        </td>
                        <td>
                          <span className="standings-stat">
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
          Sonuç = maç sonucu · Alt/Üst = 2.5 · Çift = ikisi birden doğru · İsabet =
          çift / puanlanan maç
        </p>
      ) : null}
    </div>
  );
}

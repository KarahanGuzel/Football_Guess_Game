import { FanFlag } from "@/components/fan-flag";
import { RankMedal } from "@/components/rank-medal";
import type { StandingRow } from "@/types/database";

export function StandingsTable({
  rows,
  compact = false,
}: {
  rows: StandingRow[];
  compact?: boolean;
}) {
  return (
    <div className="panel standings-panel" style={{ overflowX: "auto" }}>
      <table className={`standings-table${compact ? " standings-table-compact" : ""}`}>
        <thead>
          <tr>
            <th>#</th>
            <th>Oyuncu</th>
            <th>Puan</th>
            {!compact ? (
              <>
                <th>Doğru Sonuç</th>
                <th>Doğru Alt/Üst</th>
                <th>Perfect</th>
                <th>Başarı %</th>
              </>
            ) : (
              <th>Perfect</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={compact ? 4 : 7} className="muted standings-empty">
                Henüz hesaplanmış tahmin yok.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rank = index + 1;
              const podium = rank <= 3 ? `standings-row-top${rank}` : "";
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
                      <FanFlag slug={row.slug} displayName={row.display_name} size={13} />
                      {row.display_name}
                    </span>
                  </td>
                  <td className="standings-points">{row.total_points}</td>
                  {!compact ? (
                    <>
                      <td>{row.correct_result_count}</td>
                      <td>{row.correct_goals_count}</td>
                      <td>{row.perfect_prediction_count}</td>
                      <td>{Number(row.success_percentage).toFixed(1)}%</td>
                    </>
                  ) : (
                    <td>{row.perfect_prediction_count}</td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

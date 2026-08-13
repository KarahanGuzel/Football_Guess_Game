import { PlayerChip } from "@/components/player-chip";
import type { WeekKingRow } from "@/lib/data";

export function WeekKingsTable({
  rows,
  leaderIds = [],
  compact = false,
  titled = true,
}: {
  rows: WeekKingRow[];
  leaderIds?: string[];
  compact?: boolean;
  titled?: boolean;
}) {
  const leaderSet = new Set(leaderIds);

  return (
    <div
      className={`panel standings-panel week-kings-panel${
        titled ? " standings-panel-titled" : ""
      }${compact ? " week-kings-panel-compact" : ""}`}
    >
      {titled ? (
        <div className="standings-panel-head">
          <h2 className="section-title">Haftanın kralı</h2>
          <p className="muted standings-panel-sub">
            Her puanlanan haftanın birincisi
          </p>
        </div>
      ) : null}

      <div className="standings-scroll">
        <table
          className={`standings-table week-kings-table${
            compact ? " standings-table-compact" : ""
          }`}
        >
          <thead>
            <tr>
              <th scope="col">
                <span className="standings-th-main">Hafta</span>
              </th>
              <th scope="col">
                <span className="standings-th-main">Kral</span>
              </th>
              <th scope="col" className="standings-col-num">
                <span className="standings-th-main">Puan</span>
                <span className="standings-th-sub">hafta</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="muted standings-empty">
                  Henüz puanlanmış hafta yok. İlk skor sonrası krallar burada.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.weekId}>
                  <td className="week-kings-week-cell">
                    <span className="week-kings-week">{row.weekLabel}</span>
                  </td>
                  <td className="standings-player-cell">
                    <div className="week-kings-players">
                      {row.kings.map((king) => (
                        <PlayerChip
                          key={king.playerId}
                          slug={king.slug}
                          displayName={king.displayName}
                          size={compact ? 11 : 13}
                          crowned={leaderSet.has(king.playerId)}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="standings-col-num standings-points">
                    {row.points}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!compact && rows.length > 0 ? (
        <p className="standings-legend muted">
          Beraberlikte birden fazla kral yazılır. Taç = sezon lideri.
        </p>
      ) : null}
    </div>
  );
}

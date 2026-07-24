import { FanFlag } from "@/components/fan-flag";
import type { StandingRow } from "@/types/database";

export function StandingsTable({
  rows,
  compact = false,
}: {
  rows: StandingRow[];
  compact?: boolean;
}) {
  return (
    <div className="panel" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: compact ? 360 : 640 }}>
        <thead>
          <tr className="muted" style={{ textAlign: "left", fontSize: "0.85rem" }}>
            <th style={{ padding: "0.5rem" }}>#</th>
            <th style={{ padding: "0.5rem" }}>Oyuncu</th>
            <th style={{ padding: "0.5rem" }}>Puan</th>
            {!compact ? (
              <>
                <th style={{ padding: "0.5rem" }}>Doğru Sonuç</th>
                <th style={{ padding: "0.5rem" }}>Doğru Alt/Üst</th>
                <th style={{ padding: "0.5rem" }}>Perfect</th>
                <th style={{ padding: "0.5rem" }}>Başarı %</th>
              </>
            ) : (
              <th style={{ padding: "0.5rem" }}>Perfect</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={compact ? 4 : 7}
                className="muted"
                style={{ padding: "0.75rem" }}
              >
                Henüz hesaplanmış tahmin yok.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.player_id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "0.65rem 0.5rem" }}>{index + 1}</td>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                    }}
                  >
                    <FanFlag slug={row.slug} displayName={row.display_name} size={13} />
                    {row.display_name}
                  </span>
                </td>
                <td style={{ padding: "0.65rem 0.5rem", color: "var(--accent)" }}>
                  {row.total_points}
                </td>
                {!compact ? (
                  <>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {row.correct_result_count}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {row.correct_goals_count}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {row.perfect_prediction_count}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {Number(row.success_percentage).toFixed(1)}%
                    </td>
                  </>
                ) : (
                  <td style={{ padding: "0.65rem 0.5rem" }}>
                    {row.perfect_prediction_count}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

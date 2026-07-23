import { requirePlayer } from "@/lib/auth/current-user";
import { getStandings } from "@/lib/data";

export default async function StandingsPage() {
  await requirePlayer();

  let rows: Awaited<ReturnType<typeof getStandings>> = [];
  let errorMessage: string | null = null;

  try {
    rows = await getStandings();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Puan durumu alınamadı.";
  }

  return (
    <div>
      <h1 className="page-title">Puan Durumu</h1>
      <p className="page-sub">Toplam puana göre sıralama.</p>

      {errorMessage ? (
        <p style={{ color: "#ffb4b4" }}>{errorMessage}</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr className="muted" style={{ textAlign: "left", fontSize: "0.85rem" }}>
                <th style={{ padding: "0.5rem" }}>#</th>
                <th style={{ padding: "0.5rem" }}>Oyuncu</th>
                <th style={{ padding: "0.5rem" }}>Puan</th>
                <th style={{ padding: "0.5rem" }}>Doğru Sonuç</th>
                <th style={{ padding: "0.5rem" }}>Doğru Alt/Üst</th>
                <th style={{ padding: "0.5rem" }}>Perfect</th>
                <th style={{ padding: "0.5rem" }}>Başarı %</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted" style={{ padding: "0.75rem" }}>
                    Henüz hesaplanmış tahmin yok.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.player_id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{index + 1}</td>
                    <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700 }}>
                      {row.display_name}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem", color: "var(--accent)" }}>
                      {row.total_points}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{row.correct_result_count}</td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{row.correct_goals_count}</td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {row.perfect_prediction_count}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      {Number(row.success_percentage).toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

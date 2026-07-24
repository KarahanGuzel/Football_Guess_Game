import { BonusBadge, DerbyBadge } from "@/components/badges";
import { FanFlag } from "@/components/fan-flag";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getPredictionsForMatches,
  getWeek,
} from "@/lib/data";
import { formatKickoff } from "@/lib/format";
import { goalsLabel, resultLabel } from "@/lib/prediction-labels";
import { notFound } from "next/navigation";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  await requirePlayer();
  const { weekId } = await params;
  const week = await getWeek(weekId);
  if (!week || (week.status !== "scored" && week.status !== "locked")) {
    notFound();
  }

  const matches = await getMatchesForWeek(weekId);
  const predictions = await getPredictionsForMatches(matches.map((m) => m.id));

  return (
    <div>
      <h1 className="page-title">{week.label}</h1>
      <p className="page-sub">Maç sonuçları ve oyuncu tahminleri.</p>

      <div style={{ display: "grid", gap: "1rem" }}>
        {matches.map((match) => {
          const matchPredictions = predictions
            .filter((p) => p.match_id === match.id)
            .sort((a, b) => a.player.display_name.localeCompare(b.player.display_name, "tr"));

          return (
            <section key={match.id} className="panel" style={{ display: "grid", gap: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div>
                    <MatchTeamsLine match={match} showScores size={14} />
                  </div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {formatKickoff(match.kickoff_at)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {match.is_bonus ? <BonusBadge /> : null}
                  {match.is_derby ? <DerbyBadge /> : null}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead>
                    <tr className="muted" style={{ textAlign: "left", fontSize: "0.8rem" }}>
                      <th style={{ padding: "0.35rem" }}>Oyuncu</th>
                      <th style={{ padding: "0.35rem" }}>Sonuç</th>
                      <th style={{ padding: "0.35rem" }}>Alt/Üst</th>
                      <th style={{ padding: "0.35rem" }}>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchPredictions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="muted" style={{ padding: "0.5rem" }}>
                          Tahmin yok.
                        </td>
                      </tr>
                    ) : (
                      matchPredictions.map((prediction) => (
                        <tr
                          key={prediction.id}
                          style={{ borderTop: "1px solid var(--line)" }}
                        >
                          <td style={{ padding: "0.45rem" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              <FanFlag
                                slug={prediction.player.slug}
                                displayName={prediction.player.display_name}
                                size={12}
                              />
                              {prediction.player.display_name}
                            </span>
                          </td>
                          <td style={{ padding: "0.45rem" }}>
                            {resultLabel[prediction.result]}
                          </td>
                          <td style={{ padding: "0.45rem" }}>
                            {goalsLabel[prediction.goals_market]}
                          </td>
                          <td style={{ padding: "0.45rem", color: "var(--accent)" }}>
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
    </div>
  );
}

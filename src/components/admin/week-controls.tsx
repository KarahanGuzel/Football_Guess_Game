"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  calculateWeekPointsAction,
  deleteMatchAction,
  enterScoreAction,
  lockWeekAction,
  openWeekAction,
  setBonusMatchAction,
} from "@/app/actions/admin";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { formatKickoff } from "@/lib/format";
import type { MatchWithTeams, Week } from "@/types/database";

export function AdminWeekControls({
  week,
  matches,
}: {
  week: Week;
  matches: MatchWithTeams[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>(
    () =>
      Object.fromEntries(
        matches.map((m) => [
          m.id,
          {
            home: m.home_goals?.toString() ?? "",
            away: m.away_goals?.toString() ?? "",
          },
        ]),
      ),
  );

  function run(action: () => Promise<{ error?: string; ok?: true }>, success: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="panel" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          className="btn btn-primary"
          type="button"
          disabled={pending || week.status !== "draft"}
          onClick={() => run(() => openWeekAction(week.id), "Hafta açıldı.")}
        >
          Haftayı Aç
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          disabled={pending || week.status === "scored" || week.status === "locked"}
          onClick={() => run(() => lockWeekAction(week.id), "Hafta kilitlendi.")}
        >
          Kilitle
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={pending || week.status === "scored"}
          onClick={() =>
            run(() => calculateWeekPointsAction(week.id), "Puanlar hesaplandı.")
          }
        >
          Puanları Hesapla
        </button>
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {matches.map((match) => (
          <article key={match.id} className="panel" style={{ display: "grid", gap: "0.75rem" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>
                  {match.home_team.name} – {match.away_team.name}
                </div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {formatKickoff(match.kickoff_at)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {match.is_bonus ? <BonusBadge /> : null}
                {match.is_derby ? <DerbyBadge /> : null}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={pending || match.is_derby || match.is_bonus}
                onClick={() =>
                  run(
                    () => setBonusMatchAction(week.id, match.id),
                    "Bonus maç seçildi.",
                  )
                }
              >
                Bonus Yap
              </button>
              {week.status === "draft" ? (
                <button
                  className="btn btn-danger"
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(
                      () => deleteMatchAction(week.id, match.id),
                      "Maç silindi.",
                    )
                  }
                >
                  Sil
                </button>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                alignItems: "end",
              }}
            >
              <div className="field">
                <label>Ev gol</label>
                <input
                  type="number"
                  min={0}
                  value={scores[match.id]?.home ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [match.id]: {
                        home: e.target.value,
                        away: prev[match.id]?.away ?? "",
                      },
                    }))
                  }
                />
              </div>
              <div className="field">
                <label>Dep gol</label>
                <input
                  type="number"
                  min={0}
                  value={scores[match.id]?.away ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [match.id]: {
                        home: prev[match.id]?.home ?? "",
                        away: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    () =>
                      enterScoreAction({
                        matchId: match.id,
                        weekId: week.id,
                        homeGoals: Number(scores[match.id]?.home),
                        awayGoals: Number(scores[match.id]?.away),
                      }),
                    "Skor kaydedildi.",
                  )
                }
              >
                Skoru Kaydet
              </button>
            </div>
          </article>
        ))}
      </div>

      {message ? <p style={{ color: "var(--accent)" }}>{message}</p> : null}
    </div>
  );
}

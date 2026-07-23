"use client";

import { useMemo, useState, useTransition } from "react";
import { upsertPredictionsAction } from "@/app/actions/predictions";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { formatKickoff } from "@/lib/format";
import type { GoalsMarket, MatchWithTeams, PredictResult, Prediction } from "@/types/database";

type Draft = Record<
  string,
  {
    result: PredictResult | "";
    goalsMarket: GoalsMarket | "";
  }
>;

export function PredictionForm({
  weekId,
  matches,
  initialPredictions,
  locked,
}: {
  weekId: string;
  matches: MatchWithTeams[];
  initialPredictions: Prediction[];
  locked: boolean;
}) {
  const initialDraft = useMemo(() => {
    const draft: Draft = {};
    for (const match of matches) {
      const existing = initialPredictions.find((p) => p.match_id === match.id);
      draft[match.id] = {
        result: existing?.result ?? "",
        goalsMarket: existing?.goals_market ?? "",
      };
    }
    return draft;
  }, [matches, initialPredictions]);

  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const complete = matches.every((m) => {
    const row = draft[m.id];
    return row?.result && row?.goalsMarket;
  });

  function toggleResult(matchId: string, value: PredictResult) {
    setDraft((prev) => {
      const current = prev[matchId]?.result ?? "";
      return {
        ...prev,
        [matchId]: {
          ...prev[matchId],
          result: current === value ? "" : value,
        },
      };
    });
  }

  function toggleGoals(matchId: string, value: GoalsMarket) {
    setDraft((prev) => {
      const current = prev[matchId]?.goalsMarket ?? "";
      return {
        ...prev,
        [matchId]: {
          ...prev[matchId],
          goalsMarket: current === value ? "" : value,
        },
      };
    });
  }

  function onSave() {
    setMessage(null);
    startTransition(async () => {
      const items = matches.map((m) => ({
        matchId: m.id,
        result: draft[m.id].result as PredictResult,
        goalsMarket: draft[m.id].goalsMarket as GoalsMarket,
      }));
      const result = await upsertPredictionsAction({ weekId, items });
      if ("error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Tahminlerin kaydedildi.");
    });
  }

  return (
    <div style={{ display: "grid", gap: "0.85rem" }}>
      {matches.map((match) => {
        const row = draft[match.id] ?? { result: "", goalsMarket: "" };
        return (
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
                <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  {match.home_team.name} – {match.away_team.name}
                </div>
                <div className="muted" style={{ fontSize: "0.85rem", marginTop: 2 }}>
                  {formatKickoff(match.kickoff_at)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {match.is_bonus ? <BonusBadge /> : null}
                {match.is_derby ? <DerbyBadge /> : null}
              </div>
            </div>

            <div>
              <div className="muted" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                Maç sonucu
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(
                  [
                    ["home", `${match.home_team.short_name} kazanır`],
                    ["draw", "Berabere"],
                    ["away", `${match.away_team.short_name} kazanır`],
                  ] as const
                ).map(([value, label]) => {
                  const selected = row.result === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={locked}
                      onClick={() => toggleResult(match.id, value)}
                      className={`pick-chip${selected ? " pick-chip-selected" : ""}`}
                      style={{ cursor: locked ? "default" : "pointer" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="muted" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                Gol alt/üst 2.5
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(
                  [
                    ["under_25", "Alt 2.5"],
                    ["over_25", "Üst 2.5"],
                  ] as const
                ).map(([value, label]) => {
                  const selected = row.goalsMarket === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={locked}
                      onClick={() => toggleGoals(match.id, value)}
                      className={`pick-chip${selected ? " pick-chip-selected" : ""}`}
                      style={{ cursor: locked ? "default" : "pointer" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        );
      })}

      {!locked ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!complete || pending}
            onClick={onSave}
          >
            {pending ? "Kaydediliyor..." : "Tahminleri Kaydet"}
          </button>
          {!complete ? (
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              Tüm maçlar doldurulmadan kayıt yapılamaz.
            </span>
          ) : null}
        </div>
      ) : (
        <p className="muted">Tahminler kilitlendi.</p>
      )}

      {message ? <p style={{ color: "var(--accent)" }}>{message}</p> : null}
    </div>
  );
}

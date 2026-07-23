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

  function update(
    matchId: string,
    key: "result" | "goalsMarket",
    value: PredictResult | GoalsMarket,
  ) {
    setDraft((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [key]: value,
      },
    }));
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
        const row = draft[match.id];
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

            <fieldset disabled={locked} style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="muted" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                Maç sonucu
              </legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(
                  [
                    ["home", `${match.home_team.short_name} kazanır`],
                    ["draw", "Berabere"],
                    ["away", `${match.away_team.short_name} kazanır`],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.45rem 0.7rem",
                      borderRadius: 999,
                      border: "1px solid var(--line)",
                      background:
                        row.result === value ? "var(--bg-soft)" : "transparent",
                      cursor: locked ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={`result-${match.id}`}
                      checked={row.result === value}
                      onChange={() => update(match.id, "result", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset disabled={locked} style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="muted" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                Gol alt/üst 2.5
              </legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(
                  [
                    ["under_25", "Alt 2.5"],
                    ["over_25", "Üst 2.5"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.45rem 0.7rem",
                      borderRadius: 999,
                      border: "1px solid var(--line)",
                      background:
                        row.goalsMarket === value ? "var(--bg-soft)" : "transparent",
                      cursor: locked ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={`goals-${match.id}`}
                      checked={row.goalsMarket === value}
                      onChange={() => update(match.id, "goalsMarket", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
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

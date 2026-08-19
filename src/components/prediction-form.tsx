"use client";

import { useMemo, useState, useTransition, type CSSProperties } from "react";
import { upsertPredictionsAction } from "@/app/actions/predictions";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import { matchClubWashStyle } from "@/lib/team-colors";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { GoalsMarket, MatchWithTeams, PredictResult, Prediction } from "@/types/database";

type Draft = Record<
  string,
  {
    result: PredictResult | "";
    goalsMarket: GoalsMarket | "";
  }
>;

function buildDraft(
  matches: MatchWithTeams[],
  predictions: Prediction[],
): Draft {
  const draft: Draft = {};
  for (const match of matches) {
    const existing = predictions.find((p) => p.match_id === match.id);
    draft[match.id] = {
      result: existing?.result ?? "",
      goalsMarket: existing?.goals_market ?? "",
    };
  }
  return draft;
}

function isDraftComplete(matches: MatchWithTeams[], draft: Draft) {
  return (
    matches.length > 0 &&
    matches.every((m) => {
      const row = draft[m.id];
      return Boolean(row?.result && row?.goalsMarket);
    })
  );
}

function cloneDraft(draft: Draft): Draft {
  return Object.fromEntries(
    Object.entries(draft).map(([id, row]) => [id, { ...row }]),
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M14.1 2.6a1.8 1.8 0 0 1 2.55 2.55l-.5.5-2.55-2.55.5-.5ZM3 14.3V17h2.7l8.05-8.05-2.55-2.55L3 14.3Z" />
    </svg>
  );
}

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
  const seed = useMemo(
    () => buildDraft(matches, initialPredictions),
    [matches, initialPredictions],
  );
  const initiallySaved = useMemo(
    () => isDraftComplete(matches, seed),
    [matches, seed],
  );

  const [draft, setDraft] = useState<Draft>(seed);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(
    initiallySaved ? cloneDraft(seed) : null,
  );
  const [editing, setEditing] = useState(!initiallySaved);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const filledCount = matches.filter((m) => {
    const row = draft[m.id];
    return row?.result && row?.goalsMarket;
  }).length;
  const complete = isDraftComplete(matches, draft);
  const fillRatio = matches.length === 0 ? 0 : filledCount / matches.length;
  const showSummary = Boolean(savedDraft) && (!editing || locked);
  const isUpdate = Boolean(savedDraft);

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

  function startEditing() {
    if (locked || !savedDraft) return;
    setDraft(cloneDraft(savedDraft));
    setEditing(true);
    setMessage(null);
    setError(null);
  }

  function cancelEditing() {
    if (!savedDraft) return;
    setDraft(cloneDraft(savedDraft));
    setEditing(false);
    setMessage(null);
    setError(null);
  }

  function onSave() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const items = matches.map((m) => ({
        matchId: m.id,
        result: draft[m.id].result as PredictResult,
        goalsMarket: draft[m.id].goalsMarket as GoalsMarket,
      }));
      const result = await upsertPredictionsAction({ weekId, items });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      const nextSaved = cloneDraft(draft);
      setSavedDraft(nextSaved);
      setEditing(false);
      setMessage(isUpdate ? "Tahminlerin güncellendi." : "Tahminlerin kaydedildi.");
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1200);
    });
  }

  if (showSummary && savedDraft) {
    return (
      <div className={`prediction-summary${justSaved ? " prediction-form-saved" : ""}`}>
        <div className="prediction-summary-head">
          <h3 className="prediction-summary-title">
            Tahmin özetin
            <span className="ticket-stamp ticket-stamp-saved">Kaydedildi</span>
          </h3>
          {!locked ? (
            <button
              type="button"
              className="prediction-edit-btn"
              onClick={startEditing}
              aria-label="Tahminleri düzenle"
              title="Düzenle"
            >
              <EditIcon />
              <span>Düzenle</span>
            </button>
          ) : (
            <span className="muted" style={{ fontSize: "0.82rem" }}>
              Kilitli
            </span>
          )}
        </div>

        {matches.map((match) => {
          const row = savedDraft[match.id];
          if (!row?.result || !row.goalsMarket) return null;
          const clubWash = matchClubWashStyle({
            homeName: match.home_team.name,
          });
          return (
            <article
              key={match.id}
              className={`history-match-card${clubWash ? " club-match-wash" : ""}`}
              style={(clubWash ?? undefined) as CSSProperties | undefined}
            >
              <div className="history-match-head">
                <div>
                  <div className="history-match-teams">
                    <MatchTeamsLine match={match} size={13} />
                  </div>
                  <div className="muted history-match-kickoff">
                    {formatKickoff(match.kickoff_at)}
                  </div>
                </div>
                <div className="history-match-badges">
                  {match.is_bonus ? <BonusBadge compact /> : null}
                  {match.is_derby ? <DerbyBadge compact /> : null}
                </div>
              </div>
              <div className="prediction-summary-picks">
                <span>
                  <span className="muted">Sonuç</span>
                  {resultLabelForMatch(
                    row.result,
                    match.home_team.short_name,
                    match.away_team.short_name,
                  )}
                </span>
                <span>
                  <span className="muted">A/Ü</span>
                  {goalsLabel[row.goalsMarket]}
                </span>
              </div>
            </article>
          );
        })}

        {message ? <p className="prediction-flash prediction-flash-ok">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className={`prediction-form${justSaved ? " prediction-form-saved" : ""}`}>
      {matches.map((match) => {
        const row = draft[match.id] ?? { result: "", goalsMarket: "" };
        const marketsFilled =
          (row.result ? 1 : 0) + (row.goalsMarket ? 1 : 0);
        const cardDone = marketsFilled === 2;
        const toneClass = match.is_bonus
          ? " prediction-card-bonus"
          : match.is_derby
            ? " prediction-card-derby"
            : "";
        const clubWash = matchClubWashStyle({
          homeName: match.home_team.name,
        });

        return (
          <article
            key={match.id}
            className={`panel prediction-card${toneClass}${
              cardDone ? " prediction-card-done" : ""
            }${clubWash ? " club-match-wash" : ""}`}
            style={(clubWash ?? undefined) as CSSProperties | undefined}
            data-fill={marketsFilled}
          >
            <span
              className="prediction-card-progress"
              style={{ transform: `scaleY(${marketsFilled / 2})` }}
              aria-hidden="true"
            />

            <div className="prediction-card-head">
              <div className="prediction-card-meta">
                <div className="prediction-card-teams">
                  <MatchTeamsLine match={match} size={11} />
                </div>
                <div className="muted prediction-card-kickoff">
                  {formatKickoff(match.kickoff_at)}
                </div>
              </div>
              <div className="prediction-card-badges">
                {cardDone ? (
                  <span className="ticket-stamp" aria-label="Tamam">
                    Tamam
                  </span>
                ) : null}
                {match.is_bonus ? <BonusBadge /> : null}
                {match.is_derby ? <DerbyBadge /> : null}
              </div>
            </div>

            <div className="prediction-card-body">
              <div>
                <div className="muted prediction-field-label">Maç sonucu</div>
                <div className="pick-grid" role="group" aria-label="Maç sonucu">
                  {(
                    [
                      ["home", "1", match.home_team.name, "pick-chip-home"],
                      ["draw", "X", "Berabere", "pick-chip-draw"],
                      ["away", "2", match.away_team.name, "pick-chip-away"],
                    ] as const
                  ).map(([value, code, teamLabel, tone]) => {
                    const selected = row.result === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={locked}
                        onClick={() => toggleResult(match.id, value)}
                        className={`pick-chip ${tone}${
                          selected ? " pick-chip-selected" : ""
                        }${row.result && !selected ? " pick-chip-dim" : ""}`}
                        aria-pressed={selected}
                        title={
                          value === "draw"
                            ? "Berabere"
                            : `${teamLabel} kazanır`
                        }
                      >
                        <span className="pick-chip-short">{code}</span>
                        <span className="pick-chip-long">{teamLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="muted prediction-field-label">Gol alt/üst 2.5</div>
                <div
                  className="pick-grid pick-grid-2"
                  role="group"
                  aria-label="Alt üst 2.5"
                >
                  {(
                    [
                      ["under_25", "Alt", "2.5", "pick-chip-under"],
                      ["over_25", "Üst", "2.5", "pick-chip-over"],
                    ] as const
                  ).map(([value, code, sub, tone]) => {
                    const selected = row.goalsMarket === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={locked}
                        onClick={() => toggleGoals(match.id, value)}
                        className={`pick-chip ${tone}${
                          selected ? " pick-chip-selected" : ""
                        }${row.goalsMarket && !selected ? " pick-chip-dim" : ""}`}
                        aria-pressed={selected}
                        title={`${code} 2.5`}
                      >
                        <span className="pick-chip-short">{code}</span>
                        <span className="pick-chip-long">{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {!locked ? (
        <div className="prediction-save-bar">
          <div className="prediction-save-progress" aria-hidden="true">
            <span
              className="prediction-save-progress-fill"
              style={{ width: `${Math.round(fillRatio * 100)}%` }}
            />
          </div>
          <div className="prediction-save-row">
            <span className="prediction-save-count">
              {filledCount}/{matches.length}
            </span>
            {isUpdate ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={cancelEditing}
                disabled={pending}
              >
                Vazgeç
              </button>
            ) : null}
            <button
              className={`btn-save-pill${complete ? " btn-save-pill-ready" : ""}`}
              type="button"
              disabled={!complete || pending}
              onClick={onSave}
            >
              {pending
                ? isUpdate
                  ? "Güncelleniyor..."
                  : "Kaydediliyor..."
                : isUpdate
                  ? "Tahminleri güncelle"
                  : "Tahminleri kaydet"}
            </button>
          </div>
        </div>
      ) : (
        <p className="muted">Tahminler kilitli.</p>
      )}

      {message ? <p className="prediction-flash prediction-flash-ok">{message}</p> : null}
      {error ? <p className="prediction-flash prediction-flash-error">{error}</p> : null}
    </div>
  );
}

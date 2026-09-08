"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  clearWeekAction,
  deleteMatchAction,
  deleteWeekAction,
  lockWeekAction,
  openWeekAction,
  saveAndCalculateWeekPointsAction,
  saveWeekScoresAction,
  setBonusMatchAction,
  unlockWeekAction,
} from "@/app/actions/admin";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { canDeleteMatchFromWeek } from "@/lib/admin-season";
import { formatKickoff } from "@/lib/format";
import { canCalculateWeekPoints, effectiveWeekStatus, isKickoffLockElapsed } from "@/lib/week-lock";
import type { MatchWithTeams, Week } from "@/types/database";

type Phase = "prepare" | "open" | "locked" | "done";

function getPhase(
  week: Week,
  matches: MatchWithTeams[],
): Phase {
  const status = effectiveWeekStatus(week, matches);
  if (status === "draft") return "prepare";
  if (status === "open") return "open";
  if (status === "locked") return "locked";
  return "done";
}

export function AdminWeekControls({
  week,
  matches,
  clearBlockedReason,
}: {
  week: Week;
  matches: MatchWithTeams[];
  clearBlockedReason: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  useEffect(() => {
    setScores(
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
  }, [matches]);

  const phase = getPhase(week, matches);
  const timedOut = isKickoffLockElapsed(matches) && !week.bypass_time_lock;
  const bonusCount = matches.filter((m) => m.is_bonus).length;
  const canPublish = week.status === "draft" && matches.length > 0 && bonusCount === 1;
  const canRescore = canCalculateWeekPoints(week, matches);
  const localScoresComplete =
    matches.length > 0 &&
    matches.every((m) => {
      const row = scores[m.id];
      if (!row) return false;
      const home = Number(row.home);
      const away = Number(row.away);
      return (
        row.home !== "" &&
        row.away !== "" &&
        Number.isInteger(home) &&
        Number.isInteger(away) &&
        home >= 0 &&
        away >= 0
      );
    });

  function run(
    action: () => Promise<{ error?: string; ok?: true; message?: string }>,
    success: string,
    options?: { redirectTo?: string },
  ) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (options?.redirectTo) {
        router.push(options.redirectTo);
        router.refresh();
        return;
      }
      setMessage(result.message ?? success);
      router.refresh();
    });
  }

  const allowMatchDelete = canDeleteMatchFromWeek(week.status);

  function onDeleteWeek() {
    const confirmed = window.confirm(
      `"${week.label}" silinsin mi?\n\nBu haftaya ait maçlar ve tahminler de silinir.`,
    );
    if (!confirmed) return;
    run(() => deleteWeekAction(week.id), "Hafta silindi.", {
      redirectTo: "/admin",
    });
  }

  function onDeleteMatch(match: MatchWithTeams) {
    const label = `${match.home_team.name} – ${match.away_team.name}`;
    const bonusNote = match.is_bonus
      ? "\n\nBu maç bonus. Silince bonus seçimi de kalkar; yayınlamak için yeniden bonus seçmen gerekir."
      : "";
    const confirmed = window.confirm(
      `"${label}" silinsin mi?\n\nBu maça ait tahminler de silinir.${bonusNote}`,
    );
    if (!confirmed) return;
    run(() => deleteMatchAction(week.id, match.id), "Maç silindi.");
  }

  function matchDeleteButton(match: MatchWithTeams) {
    if (!allowMatchDelete) return null;
    return (
      <button
        className="btn btn-danger btn-sm"
        type="button"
        disabled={pending}
        onClick={() => onDeleteMatch(match)}
      >
        Sil
      </button>
    );
  }

  function scoresPayload() {
    return matches.map((m) => ({
      matchId: m.id,
      homeGoals: Number(scores[m.id]?.home),
      awayGoals: Number(scores[m.id]?.away),
    }));
  }

  return (
    <div className="stack-md">
      {phase === "prepare" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Bonus</h2>
          </div>
          {matches.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Bu haftaya henüz maç yok.
            </p>
          ) : (
            <div className="stack-xs">
              {matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  trailing={
                    <>
                      {match.is_derby ? (
                        <span className="muted" style={{ fontSize: "0.85rem" }}>
                          Derbi — bonus olamaz
                        </span>
                      ) : (
                        <button
                          className={match.is_bonus ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                          type="button"
                          disabled={pending || match.is_bonus}
                          onClick={() =>
                            run(
                              () => setBonusMatchAction(week.id, match.id),
                              "Bonus maç seçildi.",
                            )
                          }
                        >
                          {match.is_bonus ? "Bonus" : "Bonus yap"}
                        </button>
                      )}
                      {matchDeleteButton(match)}
                    </>
                  }
                />
              ))}
            </div>
          )}
          <button
            className="btn btn-primary"
            type="button"
            disabled={pending || !canPublish}
            onClick={() => run(() => openWeekAction(week.id), "Hafta yayınlandı.")}
            style={{ marginTop: "0.85rem" }}
          >
            {pending ? "Yayınlanıyor..." : "Haftayı Yayınla"}
          </button>
          {!canPublish ? (
            <p className="muted" style={{ margin: "0.55rem 0 0", fontSize: "0.85rem" }}>
              {matches.length === 0
                ? "Önce maç ekle."
                : bonusCount !== 1
                  ? "Tam 1 bonus seç."
                  : null}
            </p>
          ) : null}
        </section>
      ) : null}

      {phase === "open" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Tahminler</h2>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              disabled={pending}
              onClick={() => run(() => lockWeekAction(week.id), "Hafta kilitlendi.")}
            >
              Kilitle
            </button>
          </div>
          <div className="stack-xs">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                trailing={matchDeleteButton(match)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {phase === "locked" || phase === "done" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Skorlar</h2>
            {phase === "locked" && !timedOut ? (
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                disabled={pending}
                onClick={() =>
                  run(() => unlockWeekAction(week.id), "Kilit açıldı.")
                }
              >
                Kilidi Aç
              </button>
            ) : null}
          </div>

          {matches.map((match) => (
            <article key={match.id} className="score-block">
              <MatchRow match={match} trailing={matchDeleteButton(match)} />
              <div className="score-grid">
                <div className="field">
                  <label htmlFor={`score-home-${match.id}`}>{match.home_team.name}</label>
                  <input
                    id={`score-home-${match.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
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
                  <label htmlFor={`score-away-${match.id}`}>{match.away_team.name}</label>
                  <input
                    id={`score-away-${match.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
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
              </div>
            </article>
          ))}

          <div className="admin-action-row" style={{ marginTop: "0.35rem" }}>
            {phase === "locked" ? (
              <button
                className="btn btn-secondary"
                type="button"
                disabled={pending || !localScoresComplete}
                onClick={() =>
                  run(
                    () =>
                      saveWeekScoresAction({
                        weekId: week.id,
                        scores: scoresPayload(),
                      }),
                    "Skorlar kaydedildi.",
                  )
                }
              >
                Kaydet
              </button>
            ) : null}
            <button
              className="btn btn-primary"
              type="button"
              disabled={pending || !localScoresComplete || !canRescore}
              onClick={() =>
                run(
                  () =>
                    saveAndCalculateWeekPointsAction({
                      weekId: week.id,
                      scores: scoresPayload(),
                    }),
                  phase === "done" ? "Puanlar düzeltildi." : "Puanlar hesaplandı.",
                )
              }
            >
              {phase === "done" ? "Puanları düzelt" : "Puanları Hesapla"}
            </button>
          </div>
          {!localScoresComplete ? (
            <p className="muted" style={{ margin: "0.55rem 0 0", fontSize: "0.85rem" }}>
              Tüm skorları doldur.
            </p>
          ) : null}

          {phase === "done" ? (
            <div className="admin-clear-week" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={pending || Boolean(clearBlockedReason)}
                onClick={() => {
                  const confirmed = window.confirm(
                    `"${week.label}" temizlensin mi?\n\nSkorlar, puanlar ve bu haftanın tüm tahminleri silinir. Küpür yorumları da gider. Hafta tekrar tahmine açılır.`,
                  );
                  if (!confirmed) return;
                  run(() => clearWeekAction(week.id), "Hafta temizlendi.");
                }}
              >
                Haftayı Temizle
              </button>
              {clearBlockedReason ? (
                <p className="admin-clear-week-hint admin-clear-week-hint-blocked">
                  {clearBlockedReason}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="panel reveal danger-zone">
        <button
          className="btn btn-danger"
          type="button"
          disabled={pending}
          onClick={onDeleteWeek}
        >
          Haftayı Sil
        </button>
      </section>

      {error ? <p className="flash flash-error">{error}</p> : null}
      {message ? <p className="flash flash-ok">{message}</p> : null}
    </div>
  );
}

function MatchRow({
  match,
  trailing,
  showScores = false,
}: {
  match: MatchWithTeams;
  trailing?: ReactNode;
  showScores?: boolean;
}) {
  return (
    <div className="match-row">
      <div>
        <div>
          <MatchTeamsLine match={match} showScores={showScores} size={13} />
        </div>
        <div className="muted" style={{ fontSize: "0.85rem" }}>
          {formatKickoff(match.kickoff_at)}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
        {match.is_bonus ? <BonusBadge /> : null}
        {match.is_derby ? <DerbyBadge /> : null}
        {trailing}
      </div>
    </div>
  );
}

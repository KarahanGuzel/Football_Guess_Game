"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  calculateWeekPointsAction,
  clearWeekAction,
  deleteMatchAction,
  deleteWeekAction,
  lockWeekAction,
  openWeekAction,
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
  const allScoresSaved =
    matches.length > 0 &&
    matches.every((m) => m.home_goals !== null && m.away_goals !== null);
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
  const canPublish = week.status === "draft" && matches.length > 0 && bonusCount === 1;
  const canCalculate = canCalculateWeekPoints(week, matches) && allScoresSaved;

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

  return (
    <div className="stack-md">
      <PhaseBanner phase={phase} />

      {phase === "prepare" ? (
        <>
          <section className="panel reveal">
            <div className="section-head">
              <h2 className="section-title">1) Bonus maçı seç</h2>
            </div>
            <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
              Derbi maçlar bonus olamaz. Tam olarak bir bonus seçmelisin.
            </p>
            {matches.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Bu haftaya henüz maç yüklenmemiş.
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
                            {match.is_bonus ? "Bonus seçili" : "Bonus yap"}
                          </button>
                        )}
                        {matchDeleteButton(match)}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="panel reveal">
            <div className="section-head">
              <h2 className="section-title">2) Haftayı yayınla</h2>
            </div>
            <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
              Yayınlanınca arkadaşlar tahmin girebilir.
            </p>
            <button
              className="btn btn-primary"
              type="button"
              disabled={pending || !canPublish}
              onClick={() => run(() => openWeekAction(week.id), "Hafta yayınlandı.")}
            >
              {pending ? "Yayınlanıyor..." : "Haftayı Yayınla"}
            </button>
            {!canPublish ? (
              <p className="muted" style={{ margin: "0.65rem 0 0", fontSize: "0.85rem" }}>
                {matches.length === 0
                  ? "Önce fikstür yüklenmeli."
                  : bonusCount !== 1
                    ? "Devam etmek için 1 bonus maç seç."
                    : null}
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      {phase === "open" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Tahminler açık</h2>
          </div>
          <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
            İstediğin zaman tahminleri kilitleyebilirsin. Kilit sonrası kimse
            değiştiremez.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            disabled={pending}
            onClick={() => run(() => lockWeekAction(week.id), "Hafta kilitlendi.")}
          >
            Tahminleri Kilitle
          </button>
          <div className="stack-xs" style={{ marginTop: "1rem" }}>
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

      {phase === "locked" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Kilit / Skor</h2>
          </div>
          <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
            {timedOut
              ? "Süre doldu, tahminler kilitli. Skor için: doldur → Skorları Kaydet → Puanları Hesapla."
              : "Tahminler kilitli. Gerekirse kilidi açabilirsin. Skor için: doldur → Skorları Kaydet → Puanları Hesapla."}
          </p>
          {!timedOut ? (
            <button
              className="btn btn-secondary"
              type="button"
              disabled={pending}
              onClick={() =>
                run(() => unlockWeekAction(week.id), "Kilit açıldı. Tahminler tekrar düzenlenebilir.")
              }
              style={{ marginBottom: "1rem" }}
            >
              Kilidi Aç
            </button>
          ) : null}

          <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
            Skorları gir
          </h3>

          {matches.map((match) => (
            <article key={match.id} className="score-block">
              <MatchRow match={match} trailing={matchDeleteButton(match)} />
              <div className="score-grid">
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
              </div>
            </article>
          ))}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              marginTop: "0.35rem",
            }}
          >
            <button
              className="btn btn-secondary"
              type="button"
              disabled={pending || !localScoresComplete}
              onClick={() =>
                run(
                  () =>
                    saveWeekScoresAction({
                      weekId: week.id,
                      scores: matches.map((m) => ({
                        matchId: m.id,
                        homeGoals: Number(scores[m.id]?.home),
                        awayGoals: Number(scores[m.id]?.away),
                      })),
                    }),
                  "Skorlar kaydedildi. Şimdi puanları hesaplayabilirsin.",
                )
              }
            >
              Skorları Kaydet
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={pending || !canCalculate}
              onClick={() =>
                run(() => calculateWeekPointsAction(week.id), "Puanlar hesaplandı.")
              }
            >
              Puanları Hesapla
            </button>
          </div>
          {!localScoresComplete ? (
            <p className="muted" style={{ margin: "0.65rem 0 0", fontSize: "0.85rem" }}>
              Önce tüm maç skorlarını doldur.
            </p>
          ) : !allScoresSaved ? (
            <p className="muted" style={{ margin: "0.65rem 0 0", fontSize: "0.85rem" }}>
              Skorları kaydettikten sonra puan hesaplama aktif olur.
            </p>
          ) : (
            <p className="muted" style={{ margin: "0.65rem 0 0", fontSize: "0.85rem" }}>
              Skorlar kayıtlı. Puanları hesaplayabilirsin.
            </p>
          )}
        </section>
      ) : null}

      {phase === "done" ? (
        <section className="panel reveal">
          <div className="section-head">
            <h2 className="section-title">Hafta tamamlandı</h2>
          </div>
          <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
            Puanlar hesaplandı. Sonuçları Geçmiş sayfasından görebilirsin.
            Yanlışsa haftayı temizleyip tahminleri baştan toplayabilirsin.
          </p>
          <div className="stack-xs" style={{ marginBottom: "1rem" }}>
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} showScores />
            ))}
          </div>
          <div className="admin-clear-week">
            <button
              className="btn btn-secondary"
              type="button"
              disabled={pending || Boolean(clearBlockedReason)}
              onClick={() => {
                const confirmed = window.confirm(
                  `"${week.label}" temizlensin mi?\n\nSkorlar, puanlar ve bu haftanın tüm tahminleri silinir. Küpür yorumları da gider. Hafta tekrar tahmine açılır; oyuncular boş formdan yeniden girer.`,
                );
                if (!confirmed) return;
                run(
                  () => clearWeekAction(week.id),
                  "Hafta temizlendi. Tahminler silindi; oyuncular yeniden girebilir.",
                );
              }}
            >
              Haftayı Temizle
            </button>
            {clearBlockedReason ? (
              <p className="admin-clear-week-hint admin-clear-week-hint-blocked">
                {clearBlockedReason}
              </p>
            ) : (
              <p className="admin-clear-week-hint">
                Sadece sezonun son oynanan haftası temizlenebilir. Fikstür kalır.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <section className="panel reveal danger-zone">
        <div className="section-head">
          <h2 className="section-title">Tehlikeli alan</h2>
        </div>
        <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
          Haftayı silmek fikstürü, maçları ve tahminleri de yok eder. Sadece
          yanlış açılmış bir hafta için.
        </p>
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

function PhaseBanner({ phase }: { phase: Phase }) {
  const copy = {
    prepare: {
      title: "Hazırlık",
      text: "Fikstür yüklü. Bonus seçip haftayı yayınlaman yeterli.",
      chip: "status-draft",
    },
    open: {
      title: "Yayında",
      text: "Tahminler alınıyor. İstediğinde kilitleyebilirsin.",
      chip: "status-open",
    },
    locked: {
      title: "Kilitli",
      text: "Tahminler kilitli. Skor girip puanları hesapla.",
      chip: "status-locked",
    },
    done: {
      title: "Tamamlandı",
      text: "Bu haftanın puanları hesaplandı.",
      chip: "status-scored",
    },
  }[phase];

  return (
    <div className={`panel reveal phase-banner ${copy.chip}`}>
      <div style={{ fontWeight: 800 }}>{copy.title}</div>
      <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
        {copy.text}
      </p>
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

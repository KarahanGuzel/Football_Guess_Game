"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  calculateWeekPointsAction,
  enterScoreAction,
  openWeekAction,
  setBonusMatchAction,
} from "@/app/actions/admin";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { formatKickoff } from "@/lib/format";
import type { MatchWithTeams, Week } from "@/types/database";

type Phase = "prepare" | "published" | "done";

function getPhase(status: Week["status"]): Phase {
  if (status === "draft") return "prepare";
  if (status === "scored") return "done";
  return "published";
}

export function AdminWeekControls({
  week,
  matches,
}: {
  week: Week;
  matches: MatchWithTeams[];
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

  const phase = getPhase(week.status);
  const bonusCount = matches.filter((m) => m.is_bonus).length;
  const allScoresEntered =
    matches.length > 0 &&
    matches.every((m) => m.home_goals !== null && m.away_goals !== null);
  const canPublish = week.status === "draft" && matches.length > 0 && bonusCount === 1;

  function run(action: () => Promise<{ error?: string; ok?: true }>, success: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PhaseBanner phase={phase} />

      {phase === "prepare" ? (
        <>
          <section className="panel" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>1) Bonus maçı seç</h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              Derbi maçlar bonus olamaz. Tam olarak bir bonus seçmelisin.
            </p>
            {matches.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Bu haftaya henüz maç yüklenmemiş. Fikstür eklendikten sonra burada
                görünecek.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.15rem" }}>
                {matches.map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    trailing={
                      match.is_derby ? (
                        <span className="muted" style={{ fontSize: "0.85rem" }}>
                          Derbi — bonus olamaz
                        </span>
                      ) : (
                        <button
                          className={match.is_bonus ? "btn btn-primary" : "btn btn-secondary"}
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
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="panel" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>2) Haftayı yayınla</h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              Yayınlanınca arkadaşlar tahmin girebilir. İlk maç başlayınca tahminler
              otomatik kilitlenir.
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
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
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

      {phase === "published" ? (
        <section className="panel" style={{ display: "grid", gap: "0.85rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Skorları gir</h2>
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              Maçlar bitince skorları kaydet. Hepsi girilince puanları hesapla.
            </p>
          </div>

          {matches.map((match) => (
            <article
              key={match.id}
              style={{
                display: "grid",
                gap: "0.65rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <MatchRow match={match} />
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

          <button
            className="btn btn-primary"
            type="button"
            disabled={pending || !allScoresEntered}
            onClick={() =>
              run(() => calculateWeekPointsAction(week.id), "Puanlar hesaplandı.")
            }
          >
            Puanları Hesapla
          </button>
          {!allScoresEntered ? (
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              Hesaplama için tüm maç skorları girilmeli.
            </p>
          ) : null}
        </section>
      ) : null}

      {phase === "done" ? (
        <section className="panel" style={{ display: "grid", gap: "0.75rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Hafta tamamlandı</h2>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Puanlar hesaplandı. Sonuçları Geçmiş sayfasından görebilirsin.
          </p>
          <div style={{ display: "grid", gap: "0.15rem" }}>
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} showScores />
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--accent)", margin: 0 }}>{message}</p> : null}
    </div>
  );
}

function PhaseBanner({ phase }: { phase: Phase }) {
  const copy = {
    prepare: {
      title: "Hazırlık",
      text: "Fikstür yüklü. Bonus seçip haftayı yayınlaman yeterli.",
    },
    published: {
      title: "Yayında / Skor girişi",
      text: "Tahminler alındı veya alınıyor. Maçlar bitince skor girip puanları hesapla.",
    },
    done: {
      title: "Tamamlandı",
      text: "Bu haftanın puanları hesaplandı.",
    },
  }[phase];

  return (
    <div className="panel">
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
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "0.5rem",
        alignItems: "center",
        padding: "0.55rem 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>
          {match.home_team.name}
          {showScores ? ` ${match.home_goals ?? "-"} : ${match.away_goals ?? "-"} ` : " – "}
          {match.away_team.name}
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

"use client";

import { useEffect, useState } from "react";
import { HistoryWeekContent } from "@/components/history-week-content";
import { TeamFlag } from "@/components/team-flag";
import { summarizeAlmanacWeek } from "@/lib/history-almanac";
import type { MatchWithTeams, Player, Prediction, Week } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

export type HistoryWeekBundle = {
  week: Week;
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
};

export function HistoryWeeksAccordion({
  weeks,
  initialOpenId = null,
  currentPlayerId,
}: {
  weeks: HistoryWeekBundle[];
  initialOpenId?: string | null;
  currentPlayerId: string;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(initialOpenId ? [initialOpenId] : []),
  );

  useEffect(() => {
    if (!initialOpenId) return;
    setOpenIds((current) => {
      if (current.has(initialOpenId)) return current;
      const next = new Set(current);
      next.add(initialOpenId);
      return next;
    });
    const node = document.getElementById(`history-week-${initialOpenId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialOpenId]);

  function toggle(weekId: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  }

  return (
    <ul className="history-accordion history-almanac">
      {weeks.map(({ week, matches, predictions }) => {
        const isOpen = openIds.has(week.id);
        const almanac = summarizeAlmanacWeek({
          label: week.label,
          status: week.status,
          matches,
          predictions,
          currentPlayerId,
        });
        const scored = week.status === "scored";

        return (
          <li
            key={week.id}
            id={`history-week-${week.id}`}
            className={`panel history-week-item history-almanac-card${
              isOpen ? " history-week-item-open" : ""
            }${scored ? "" : " history-almanac-card-locked"}`}
          >
            <button
              type="button"
              className="history-week-toggle history-almanac-toggle"
              onClick={() => toggle(week.id)}
              aria-expanded={isOpen}
            >
              <span className="history-almanac-no" aria-hidden="true">
                {almanac.weekNo ?? "—"}
              </span>
              <span className="history-almanac-main">
                <span className="history-week-label">{week.label}</span>
                <span className="history-almanac-lines">
                  {almanac.kingNames.length > 0 ? (
                    <span>
                      Kral: {almanac.kingNames.join(", ")}
                      {almanac.kingPoints != null ? ` · ${almanac.kingPoints}p` : ""}
                    </span>
                  ) : (
                    <span className="muted">
                      {scored ? "Kral yok" : "Henüz puanlanmadı"}
                    </span>
                  )}
                  <span>
                    Sen:{" "}
                    {almanac.yourPoints != null ? `${almanac.yourPoints} puan` : "—"}
                  </span>
                </span>
                <span className="history-almanac-crests">
                  {almanac.teamNames.map((name) => (
                    <TeamFlag key={name} teamName={name} size={12} />
                  ))}
                  <span className="muted history-week-meta">
                    {almanac.matchCount} maç
                  </span>
                </span>
              </span>
              <span className="history-almanac-side">
                <span
                  className={`ticket-stamp${
                    scored ? " ticket-stamp-scored" : " ticket-stamp-locked"
                  }`}
                >
                  {almanac.stamp}
                </span>
                <span
                  className={`history-week-chevron${isOpen ? " history-week-chevron-open" : ""}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
                  </svg>
                </span>
              </span>
            </button>

            {isOpen ? (
              <HistoryWeekContent matches={matches} predictions={predictions} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

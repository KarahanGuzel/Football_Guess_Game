"use client";

import { useEffect, useState } from "react";
import { HistoryWeekContent } from "@/components/history-week-content";
import type { MatchWithTeams, Player, Prediction, Week } from "@/types/database";

type PredictionWithPlayer = Prediction & { player: Player };

export type HistoryWeekBundle = {
  week: Week;
  matches: MatchWithTeams[];
  predictions: PredictionWithPlayer[];
};

const statusLabel: Record<string, string> = {
  locked: "Kilitli",
  scored: "Puanlandı",
};

export function HistoryWeeksAccordion({
  weeks,
  initialOpenId = null,
}: {
  weeks: HistoryWeekBundle[];
  initialOpenId?: string | null;
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
    <ul className="history-accordion">
      {weeks.map(({ week, matches, predictions }) => {
        const isOpen = openIds.has(week.id);
        const matchCount = matches.length;

        return (
          <li
            key={week.id}
            id={`history-week-${week.id}`}
            className={`panel history-week-item${isOpen ? " history-week-item-open" : ""}`}
          >
            <button
              type="button"
              className="history-week-toggle"
              onClick={() => toggle(week.id)}
              aria-expanded={isOpen}
            >
              <span className="history-week-toggle-main">
                <span className="history-week-label">{week.label}</span>
                <span className="muted history-week-meta">
                  {matchCount} maç · {statusLabel[week.status] ?? week.status}
                </span>
              </span>
              <span
                className={`history-week-chevron${isOpen ? " history-week-chevron-open" : ""}`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
                </svg>
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

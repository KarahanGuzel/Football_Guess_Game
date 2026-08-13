"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlayerChip } from "@/components/player-chip";
import type { Player, Week } from "@/types/database";

export type PastWeekSummary = {
  week: Week;
  rows: {
    player: Player;
    points: number | null;
    hasPicks: boolean;
  }[];
};

export function PastWeeksAccordion({
  weeks,
  leaderIds = [],
}: {
  weeks: PastWeekSummary[];
  leaderIds?: string[];
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const leaders = useMemo(() => new Set(leaderIds), [leaderIds]);

  function toggle(weekId: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  }

  return (
    <ul className="past-weeks-accordion">
      {weeks.map(({ week, rows }) => {
        const isOpen = openIds.has(week.id);
        const scored = week.status === "scored";

        return (
          <li
            key={week.id}
            className={`past-week-item${isOpen ? " past-week-item-open" : ""}`}
          >
            <button
              type="button"
              className="past-week-toggle"
              onClick={() => toggle(week.id)}
              aria-expanded={isOpen}
            >
              <span className="past-week-card-main">
                <span className="past-week-label">{week.label}</span>
                <span className="past-week-hint">
                  {scored ? "Haftalık puan özeti" : "Henüz puanlanmadı"}
                </span>
              </span>
              <span className="past-week-card-side">
                <span className={`status-chip status-${week.status}`}>
                  {scored ? "Puanlandı" : "Kilitli"}
                </span>
                <span
                  className={`past-week-chevron${isOpen ? " past-week-chevron-open" : ""}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
                  </svg>
                </span>
              </span>
            </button>

            {isOpen ? (
              <div className="past-week-drawer">
                {rows.length === 0 ? (
                  <p className="muted past-week-empty">Bu hafta için kayıt yok.</p>
                ) : (
                  <ul className="past-week-points-list">
                    {rows.map((row, index) => (
                      <li key={row.player.id} className="past-week-points-row">
                        <span className="past-week-points-rank">{index + 1}</span>
                        <span className="past-week-points-player">
                          <PlayerChip
                            slug={row.player.slug}
                            displayName={row.player.display_name}
                            size={12}
                            crowned={leaders.has(row.player.id)}
                          />
                        </span>
                        <span className="past-week-points-value">
                          {row.points === null
                            ? "—"
                            : `${row.points}`}
                          {row.points !== null ? (
                            <span className="past-week-points-unit"> puan</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="past-week-drawer-foot">
                  <Link
                    href={`/history?week=${week.id}`}
                    className="past-week-details-link"
                  >
                    Detaylar
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

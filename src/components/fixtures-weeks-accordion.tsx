"use client";

import { useState } from "react";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import type { MatchWithTeams, Week } from "@/types/database";

export type FixtureWeekBundle = {
  week: Week;
  matches: MatchWithTeams[];
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`fixtures-week-chevron${open ? " fixtures-week-chevron-open" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
      </svg>
    </span>
  );
}

export function FixturesWeeksAccordion({ weeks }: { weeks: FixtureWeekBundle[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(weeks[0] ? [weeks[0].week.id] : []),
  );

  function toggle(weekId: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  }

  return (
    <ul className="fixtures-accordion">
      {weeks.map(({ week, matches }) => {
        const isOpen = openIds.has(week.id);
        return (
          <li
            key={week.id}
            className={`panel fixtures-week-item${isOpen ? " fixtures-week-item-open" : ""}`}
          >
            <button
              type="button"
              className="fixtures-week-toggle"
              onClick={() => toggle(week.id)}
              aria-expanded={isOpen}
            >
              <span className="fixtures-week-toggle-main">
                <span className="fixtures-week-label">{week.label}</span>
                <span className="muted fixtures-week-meta">
                  {matches.length} maç
                </span>
              </span>
              <Chevron open={isOpen} />
            </button>

            {isOpen ? (
              <div className="fixtures-week-body">
                {matches.map((match) => (
                  <article key={match.id} className="fixtures-match-card">
                    <div>
                      <div className="fixtures-match-teams">
                        <MatchTeamsLine match={match} size={13} />
                      </div>
                      <div className="muted fixtures-match-kickoff">
                        {formatKickoff(match.kickoff_at)}
                      </div>
                    </div>
                    <div className="fixtures-match-badges">
                      {match.is_bonus ? <BonusBadge compact /> : null}
                      {match.is_derby ? <DerbyBadge compact /> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

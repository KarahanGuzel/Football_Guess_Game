import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import type { AgreeingPlayer } from "@/lib/pick-agreement";
import { matchClubWashStyle } from "@/lib/team-colors";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { GoalsMarket, MatchWithTeams, PredictResult } from "@/types/database";
import type { CSSProperties } from "react";

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M4.5 3.5h11v3.2c-1.15.2-1.15 1.9 0 2.1v2.4c-1.15.2-1.15 1.9 0 2.1v3.2h-11v-3.2c1.15-.2 1.15-1.9 0-2.1V8.8c1.15-.2 1.15-1.9 0-2.1V3.5Z" />
      <path d="M8 6.2v7.6" strokeDasharray="1.6 1.7" />
    </svg>
  );
}

export function SavedMatchCard({
  match,
  result,
  goalsMarket,
  allies,
}: {
  match: MatchWithTeams;
  result: PredictResult;
  goalsMarket: GoalsMarket;
  allies: AgreeingPlayer[];
}) {
  const clubWash = matchClubWashStyle({ homeName: match.home_team.name });

  return (
    <article
      className={`history-match-card slip-saved-card${clubWash ? " club-match-wash" : ""}`}
      style={(clubWash ?? undefined) as CSSProperties | undefined}
    >
      <div className="slip-saved-main">
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
              result,
              match.home_team.short_name,
              match.away_team.short_name,
            )}
          </span>
          <span>
            <span className="muted">A/Ü</span>
            {goalsLabel[goalsMarket]}
          </span>
        </div>
      </div>

      {allies.length > 0 ? (
        <div className="slip-saved-allies" aria-label="Aynı tahmini yapanlar">
          {allies.map((ally) => (
            <span
              key={ally.playerId}
              className="slip-ticket-icon"
              title={ally.displayName}
            >
              <TicketIcon />
              <span className="sr-only">{ally.displayName}</span>
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

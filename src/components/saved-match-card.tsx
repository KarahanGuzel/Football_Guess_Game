import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import type { AgreeingPlayer } from "@/lib/pick-agreement";
import { matchClubWashStyle } from "@/lib/team-colors";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { GoalsMarket, MatchWithTeams, PredictResult } from "@/types/database";
import type { CSSProperties } from "react";

/** Original filled pinky silhouette — not the Iddaa mascot. */
function PinkyAgreeIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g fill="currentColor" transform="rotate(-12 16 18)">
        <rect x="9.1" y="1.5" width="6.6" height="14.8" rx="3.3" />
        <path d="M9.6 14.1h11.8a4.7 4.7 0 0 1 4.7 4.7v5.3A5.9 5.9 0 0 1 20.2 30H10.8A5.9 5.9 0 0 1 4.9 24.1v-5.3A4.7 4.7 0 0 1 9.6 14.1Z" />
        <ellipse cx="24.8" cy="18.5" rx="4.5" ry="3.9" />
      </g>
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
  const hasBadges = match.is_bonus || match.is_derby;
  const showSide = hasBadges || allies.length > 0;

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

      {showSide ? (
        <div className="slip-saved-side">
          {hasBadges ? (
            <div className="history-match-badges">
              {match.is_bonus ? <BonusBadge compact /> : null}
              {match.is_derby ? <DerbyBadge compact /> : null}
            </div>
          ) : null}

          {allies.length > 0 ? (
            <div className="slip-saved-allies" aria-label="Aynı tahmini yapanlar">
              {allies.map((ally) => (
                <span
                  key={ally.playerId}
                  className="slip-agree-tip"
                  tabIndex={0}
                >
                  <span className="slip-agree-icon">
                    <PinkyAgreeIcon />
                  </span>
                  <span className="slip-agree-bubble">{ally.displayName}</span>
                  <span className="sr-only">{ally.displayName}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

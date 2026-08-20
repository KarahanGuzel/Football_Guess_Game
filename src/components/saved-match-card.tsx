import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import { formatKickoff } from "@/lib/format";
import type { AgreeingPlayer } from "@/lib/pick-agreement";
import { matchClubWashStyle } from "@/lib/team-colors";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { GoalsMarket, MatchWithTeams, PredictResult } from "@/types/database";
import type { CSSProperties } from "react";

/** Filled pinky-up fist (original “2 Dolu” sheet), not the Iddaa mascot. */
function PinkyAgreeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.6 1.15C18.7 1.15 19.15 1.85 19.15 2.7V15.4C19.15 17.6 18.55 19.6 17.45 21.2C16.7 22.35 15.45 22.95 14.15 22.95H9.7C8.35 22.95 7.15 22.25 6.45 21.1C5.4 19.35 4.75 17.2 4.95 15.15C5.1 13.7 5.75 12.45 6.7 11.7C6.55 10.35 6.7 9.15 7.15 8.15C7.45 7.55 8.1 7.2 8.75 7.25C9.15 7.28 9.5 7.48 9.75 7.8C10.05 7.45 10.55 7.2 11.1 7.2C11.7 7.2 12.2 7.5 12.5 7.95C12.85 7.55 13.4 7.3 14 7.35C14.7 7.4 15.25 7.85 15.5 8.45C15.75 8.3 16.05 8.25 16.25 8.3V2.7C16.25 1.85 16.65 1.15 17.6 1.15Z"
      />
      <g
        fill="none"
        stroke="color-mix(in srgb, currentColor 58%, #0a1210)"
        strokeWidth="1.12"
        strokeLinecap="round"
      >
        <path d="M15.85 9.2c-.15 1.55-.7 2.7-1.55 3.35" />
        <path d="M12.55 8.85c-.2 1.35-.85 2.45-1.7 3.05" />
        <path d="M9.85 8.95c-.25 1.2-.95 2.2-1.75 2.7" />
        <path d="M8.2 13.4c1.1.35 2.35.15 3.4-.55" />
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

  return (
    <article
      className={`history-match-card slip-saved-card${clubWash ? " club-match-wash" : ""}`}
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

      <div className="slip-saved-picks-row">
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
    </article>
  );
}

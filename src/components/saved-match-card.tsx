import { BonusBadge, DerbyBadge } from "@/components/badges";
import { PlayerChip } from "@/components/player-chip";
import { TeamName } from "@/components/team-flag";
import { formatKickoff } from "@/lib/format";
import type { AgreeingPlayer } from "@/lib/pick-agreement";
import { matchClubWashStyle } from "@/lib/team-colors";
import { goalsLabel, resultLabelForMatch } from "@/lib/prediction-labels";
import type { GoalsMarket, MatchWithTeams, PredictResult } from "@/types/database";
import type { CSSProperties } from "react";

export function SavedMatchCard({
  match,
  result,
  goalsMarket,
  locked,
  allies,
}: {
  match: MatchWithTeams;
  result: PredictResult;
  goalsMarket: GoalsMarket;
  locked: boolean;
  allies: AgreeingPlayer[];
}) {
  const clubWash = matchClubWashStyle({ homeName: match.home_team.name });

  return (
    <article
      className={`slip-match-card${clubWash ? " club-match-wash" : ""}`}
      style={(clubWash ?? undefined) as CSSProperties | undefined}
    >
      <div className="slip-fixture-box">
        <TeamName name={match.home_team.name} size={14} />
        <span className="slip-fixture-vs">vs</span>
        <TeamName name={match.away_team.name} size={14} />
      </div>

      <div className="slip-match-meta">
        <span className="muted">{formatKickoff(match.kickoff_at)}</span>
        <span className="slip-match-badges">
          {match.is_bonus ? <BonusBadge compact /> : null}
          {match.is_derby ? <DerbyBadge compact /> : null}
        </span>
      </div>

      <div className="slip-pick-row">
        <span className="slip-pick-k">Sonuç</span>
        <span className="slip-pick-v">
          {resultLabelForMatch(
            result,
            match.home_team.short_name,
            match.away_team.short_name,
          )}
        </span>
      </div>
      <div className="slip-pick-row">
        <span className="slip-pick-k">Alt/Üst</span>
        <span className="slip-pick-v">{goalsLabel[goalsMarket]}</span>
      </div>

      <div className="slip-agree">
        {locked ? (
          allies.length > 0 ? (
            <>
              <span className="slip-agree-label">Seninle aynı</span>
              <span className="slip-agree-people">
                {allies.map((ally) => (
                  <PlayerChip
                    key={ally.playerId}
                    slug={ally.slug}
                    displayName={ally.displayName}
                    size={11}
                  />
                ))}
              </span>
            </>
          ) : (
            <span className="slip-agree-empty">Bu maçta yalnızsın.</span>
          )
        ) : (
          <span className="slip-agree-empty">
            Kilitlenince kimlerle aynı tahmin yaptığı görünür.
          </span>
        )}
      </div>
    </article>
  );
}

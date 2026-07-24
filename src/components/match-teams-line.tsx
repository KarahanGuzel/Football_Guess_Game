import { TeamName } from "@/components/team-flag";
import type { MatchWithTeams } from "@/types/database";

export function MatchTeamsLine({
  match,
  showScores = false,
  size = 13,
}: {
  match: MatchWithTeams;
  showScores?: boolean;
  size?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.4rem",
        fontWeight: 700,
      }}
    >
      <TeamName name={match.home_team.name} size={size} />
      {showScores ? (
        <span style={{ fontWeight: 800 }}>
          {match.home_goals ?? "-"} : {match.away_goals ?? "-"}
        </span>
      ) : (
        <span className="muted" style={{ fontWeight: 600 }}>
          –
        </span>
      )}
      <TeamName name={match.away_team.name} size={size} />
    </span>
  );
}

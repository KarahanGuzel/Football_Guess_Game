import type { MatchWithTeams } from "@/types/database";

/** Derbies first, then kickoff order. */
export function sortMatchesForDisplay(
  matches: MatchWithTeams[],
): MatchWithTeams[] {
  return [...matches].sort((a, b) => {
    if (a.is_derby !== b.is_derby) return a.is_derby ? -1 : 1;
    return a.kickoff_at.localeCompare(b.kickoff_at);
  });
}

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { effectiveWeekStatus, weekLockAt } from "@/lib/week-lock";
import type {
  MatchWithTeams,
  Player,
  Prediction,
  StandingRow,
  Team,
  Week,
} from "@/types/database";

const matchSelect = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*)
`;

export async function listActivePlayers(): Promise<Player[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("players")
    .select("*")
    .eq("is_active", true)
    .order("display_name");

  if (error) throw error;
  return data ?? [];
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("players")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listTeams(): Promise<Team[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("teams")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function listWeeks(): Promise<Week[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getWeek(weekId: string): Promise<Week | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .eq("id", weekId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getMatchesForWeek(weekId: string): Promise<MatchWithTeams[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("matches")
    .select(matchSelect)
    .eq("week_id", weekId)
    .order("kickoff_at");

  if (error) throw error;
  return (data ?? []) as MatchWithTeams[];
}

export async function getCurrentPlayableWeek(): Promise<{
  week: Week;
  matches: MatchWithTeams[];
  lockAt: Date | null;
  status: ReturnType<typeof effectiveWeekStatus>;
} | null> {
  const { data: weeks, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .in("status", ["open", "locked"])
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  if (!weeks?.length) return null;

  for (const week of weeks) {
    const matches = await getMatchesForWeek(week.id);
    const status = effectiveWeekStatus(week, matches);
    if (status === "open" || status === "locked") {
      return { week, matches, lockAt: weekLockAt(matches), status };
    }
  }

  return null;
}

export async function getNextFixturesWeek(): Promise<{
  week: Week;
  matches: MatchWithTeams[];
} | null> {
  const { data: weeks, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  const week = weeks?.[0];
  if (!week) return null;

  const matches = await getMatchesForWeek(week.id);
  return { week, matches };
}

export async function getPastWeeks(): Promise<Week[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .in("status", ["scored", "locked"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPredictionsForPlayer(
  playerId: string,
  matchIds: string[],
): Promise<Prediction[]> {
  if (matchIds.length === 0) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("predictions")
    .select("*")
    .eq("player_id", playerId)
    .in("match_id", matchIds);

  if (error) throw error;
  return data ?? [];
}

export async function getPredictionsForMatches(
  matchIds: string[],
): Promise<(Prediction & { player: Player })[]> {
  if (matchIds.length === 0) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("predictions")
    .select("*, player:players(*)")
    .in("match_id", matchIds);

  if (error) throw error;
  return (data ?? []) as (Prediction & { player: Player })[];
}

export async function getStandings(): Promise<StandingRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("standings")
    .select("*")
    .order("total_points", { ascending: false })
    .order("perfect_prediction_count", { ascending: false })
    .order("display_name");

  if (error) throw error;
  return data ?? [];
}

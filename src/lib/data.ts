import { getSupabaseAdmin } from "@/lib/supabase/server";
import { effectiveWeekStatus, weekLockAt } from "@/lib/week-lock";
import type {
  MatchWithTeams,
  Player,
  Prediction,
  SlipCommentWithAuthor,
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
      return {
        week,
        matches,
        lockAt: week.bypass_time_lock ? null : weekLockAt(matches),
        status,
      };
    }
  }

  return null;
}

export async function getNextFixturesWeek(): Promise<{
  week: Week;
  matches: MatchWithTeams[];
} | null> {
  const weeks = await getNextFixturesWeeks(1);
  return weeks[0] ?? null;
}

/** Upcoming draft weeks with matches, soonest first (default 3). */
export async function getNextFixturesWeeks(
  limit = 3,
): Promise<{ week: Week; matches: MatchWithTeams[] }[]> {
  const { data: weeks, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .eq("status", "draft")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!weeks?.length) return [];

  const bundles: { week: Week; matches: MatchWithTeams[]; sortKey: string }[] =
    [];

  for (const week of weeks) {
    const matches = await getMatchesForWeek(week.id);
    if (matches.length === 0) continue;
    bundles.push({
      week,
      matches,
      sortKey: matches[0]?.kickoff_at ?? week.created_at,
    });
  }

  bundles.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return bundles.slice(0, limit).map(({ week, matches }) => ({ week, matches }));
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

/** Season leaders (tied #1). Empty until someone has points. */
export function getSeasonLeaderIds(rows: StandingRow[]): string[] {
  if (rows.length === 0) return [];
  const top = rows[0]?.total_points ?? 0;
  if (top <= 0) return [];
  return rows
    .filter((row) => row.total_points === top)
    .map((row) => row.player_id);
}

export type WeekKingPlayer = {
  playerId: string;
  displayName: string;
  slug: string;
};

export type WeekKingRow = {
  weekId: string;
  weekLabel: string;
  points: number;
  kings: WeekKingPlayer[];
};

/** Per scored week: player(s) with the highest week points (ties kept). */
export async function getWeekKings(): Promise<WeekKingRow[]> {
  const { data: scoredWeeks, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .eq("status", "scored")
    .order("created_at", { ascending: true });

  if (error) throw error;
  const weeks = scoredWeeks ?? [];
  if (weeks.length === 0) return [];

  const result: WeekKingRow[] = [];

  for (const week of weeks) {
    const matches = await getMatchesForWeek(week.id);
    if (matches.length === 0) continue;

    const predictions = await getPredictionsForMatches(
      matches.map((m) => m.id),
    );
    const pointsByPlayer = new Map<
      string,
      { points: number; player: Player }
    >();

    for (const prediction of predictions) {
      if (prediction.points_earned == null) continue;
      const current = pointsByPlayer.get(prediction.player_id);
      if (current) {
        current.points += prediction.points_earned;
      } else {
        pointsByPlayer.set(prediction.player_id, {
          points: prediction.points_earned,
          player: prediction.player,
        });
      }
    }

    if (pointsByPlayer.size === 0) continue;

    const ranked = [...pointsByPlayer.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.player.display_name.localeCompare(b.player.display_name, "tr");
    });
    const topPoints = ranked[0].points;
    const kings = ranked
      .filter((row) => row.points === topPoints)
      .map((row) => ({
        playerId: row.player.id,
        displayName: row.player.display_name,
        slug: row.player.slug,
      }));

    result.push({
      weekId: week.id,
      weekLabel: week.label,
      points: topPoints,
      kings,
    });
  }

  return result;
}

export type StandingsProgressWeek = {
  id: string;
  label: string;
};

export type StandingsProgressSeries = {
  playerId: string;
  displayName: string;
  slug: string;
  totals: number[];
};

export type StandingsProgress = {
  weeks: StandingsProgressWeek[];
  series: StandingsProgressSeries[];
};

/** Cumulative total points after each scored week, for all active players. */
export async function getStandingsProgress(): Promise<StandingsProgress> {
  const players = await listActivePlayers();

  const { data: scoredWeeks, error } = await getSupabaseAdmin()
    .from("weeks")
    .select("*")
    .eq("status", "scored")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const weeks = scoredWeeks ?? [];
  if (weeks.length === 0) {
    return {
      weeks: [],
      series: players.map((p) => ({
        playerId: p.id,
        displayName: p.display_name,
        slug: p.slug,
        totals: [],
      })),
    };
  }

  const running = new Map(players.map((p) => [p.id, 0]));
  const totalsByPlayer = new Map(players.map((p) => [p.id, [] as number[]]));

  for (const week of weeks) {
    const matches = await getMatchesForWeek(week.id);
    const predictions = await getPredictionsForMatches(matches.map((m) => m.id));
    const weekPoints = new Map<string, number>();

    for (const prediction of predictions) {
      if (prediction.points_earned == null) continue;
      weekPoints.set(
        prediction.player_id,
        (weekPoints.get(prediction.player_id) ?? 0) + prediction.points_earned,
      );
    }

    for (const player of players) {
      const next = (running.get(player.id) ?? 0) + (weekPoints.get(player.id) ?? 0);
      running.set(player.id, next);
      totalsByPlayer.get(player.id)!.push(next);
    }
  }

  // Keep chart ordered like current standings (highest final total first)
  const series = players
    .map((player) => ({
      playerId: player.id,
      displayName: player.display_name,
      slug: player.slug,
      totals: totalsByPlayer.get(player.id) ?? [],
    }))
    .sort((a, b) => {
      const at = a.totals[a.totals.length - 1] ?? 0;
      const bt = b.totals[b.totals.length - 1] ?? 0;
      if (bt !== at) return bt - at;
      return a.displayName.localeCompare(b.displayName, "tr");
    });

  return {
    weeks: weeks.map((w) => ({ id: w.id, label: w.label })),
    series,
  };
}

/** All slip comments for a week, oldest first, with author player. */
export async function getSlipCommentsForWeek(
  weekId: string,
): Promise<SlipCommentWithAuthor[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("slip_comments")
    .select("*, author:players!slip_comments_author_player_id_fkey(*)")
    .eq("week_id", weekId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SlipCommentWithAuthor[];
}

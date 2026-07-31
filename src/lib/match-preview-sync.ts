import {
  fetchFixturePrediction,
  fetchLeagueFixturesInRange,
  type ApiFootballFixture,
} from "@/lib/api-football";
import { getMatchesForWeek, getPreviewsForMatches } from "@/lib/data";
import { findFixtureForMatch } from "@/lib/match-preview-match";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function istanbulDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function shiftDate(yyyyMmDd: string, days: number): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export type SyncWeekPreviewsResult = {
  ok: true;
  requestsUsed: number;
  synced: number;
  skippedExisting: number;
  unmatched: string[];
  missingPrediction: string[];
};

export async function syncWeekPreviews(options: {
  weekId: string;
  force?: boolean;
}): Promise<SyncWeekPreviewsResult | { error: string }> {
  const matches = await getMatchesForWeek(options.weekId);
  if (matches.length === 0) {
    return { error: "Bu haftada maç yok." };
  }

  const existing = await getPreviewsForMatches(matches.map((m) => m.id));
  const existingByMatch = new Map(existing.map((p) => [p.match_id, p]));

  const targets = options.force
    ? matches
    : matches.filter((m) => !existingByMatch.has(m.id));

  if (targets.length === 0) {
    return {
      ok: true,
      requestsUsed: 0,
      synced: 0,
      skippedExisting: matches.length,
      unmatched: [],
      missingPrediction: [],
    };
  }

  const dates = matches.map((m) => istanbulDate(m.kickoff_at)).sort();
  const from = shiftDate(dates[0], -1);
  const to = shiftDate(dates[dates.length - 1], 1);

  let requestsUsed = 0;
  let fixtures: ApiFootballFixture[];
  try {
    fixtures = await fetchLeagueFixturesInRange({ from, to });
    requestsUsed += 1;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Fikstür listesi alınamadı.",
    };
  }

  const unmatched: string[] = [];
  const missingPrediction: string[] = [];
  let synced = 0;
  const db = getSupabaseAdmin();

  for (const match of targets) {
    const fixture =
      (match.api_football_fixture_id
        ? fixtures.find((f) => f.fixtureId === match.api_football_fixture_id)
        : null) ?? findFixtureForMatch(match, fixtures);

    if (!fixture) {
      unmatched.push(
        `${match.home_team.short_name}-${match.away_team.short_name}`,
      );
      continue;
    }

    if (match.api_football_fixture_id !== fixture.fixtureId) {
      await db
        .from("matches")
        .update({ api_football_fixture_id: fixture.fixtureId })
        .eq("id", match.id);
    }

    if (!match.home_team.api_football_id) {
      await db
        .from("teams")
        .update({ api_football_id: fixture.home.id })
        .eq("id", match.home_team_id)
        .is("api_football_id", null);
    }
    if (!match.away_team.api_football_id) {
      await db
        .from("teams")
        .update({ api_football_id: fixture.away.id })
        .eq("id", match.away_team_id)
        .is("api_football_id", null);
    }

    let prediction;
    try {
      prediction = await fetchFixturePrediction(fixture.fixtureId);
      requestsUsed += 1;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `${match.home_team.short_name}-${match.away_team.short_name}: ${error.message}`
            : "Prediction alınamadı.",
      };
    }

    if (!prediction) {
      missingPrediction.push(
        `${match.home_team.short_name}-${match.away_team.short_name}`,
      );
      continue;
    }

    const { error } = await db.from("match_previews").upsert(
      {
        match_id: match.id,
        api_football_fixture_id: fixture.fixtureId,
        winner_name: prediction.winnerName,
        winner_comment: prediction.winnerComment,
        win_or_draw: prediction.winOrDraw,
        under_over: prediction.underOver,
        goals_home: prediction.goalsHome,
        goals_away: prediction.goalsAway,
        advice: prediction.advice,
        percent_home: prediction.percentHome,
        percent_draw: prediction.percentDraw,
        percent_away: prediction.percentAway,
        raw: prediction.raw,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "match_id" },
    );

    if (error) {
      return { error: error.message };
    }
    synced += 1;
  }

  return {
    ok: true,
    requestsUsed,
    synced,
    skippedExisting: matches.length - targets.length,
    unmatched,
    missingPrediction,
  };
}

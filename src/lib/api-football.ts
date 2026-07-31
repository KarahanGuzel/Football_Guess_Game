/**
 * Minimal API-Football (api-sports.io) client for match previews.
 * Server-only — never import from client components.
 */

export type ApiFootballFixture = {
  fixtureId: number;
  kickoffAt: string;
  home: { id: number; name: string };
  away: { id: number; name: string };
  statusShort: string;
};

export type ApiFootballPrediction = {
  fixtureId: number;
  winnerName: string | null;
  winnerComment: string | null;
  winOrDraw: boolean | null;
  underOver: string | null;
  goalsHome: string | null;
  goalsAway: string | null;
  advice: string | null;
  percentHome: number | null;
  percentDraw: number | null;
  percentAway: number | null;
  raw: unknown;
};

type ApiEnvelope<T> = {
  errors?: unknown;
  response?: T;
};

function getConfig() {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key) {
    throw new Error("API_FOOTBALL_KEY tanımlı değil.");
  }
  const baseUrl = (
    process.env.API_FOOTBALL_BASE_URL?.trim() ||
    "https://v3.football.api-sports.io"
  ).replace(/\/$/, "");
  const leagueId = Number(process.env.API_FOOTBALL_LEAGUE_ID ?? "203");
  const season = Number(
    process.env.API_FOOTBALL_SEASON ?? new Date().getUTCFullYear(),
  );
  return { key, baseUrl, leagueId, season };
}

async function apiGet<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  const { key, baseUrl } = getConfig();
  const url = new URL(`${baseUrl}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API-Football HTTP ${res.status}`);
  }

  const body = (await res.json()) as ApiEnvelope<T> & {
    message?: string;
  };

  if (body.errors && Object.keys(body.errors as object).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(body.errors)}`);
  }

  return (body.response ?? []) as T;
}

export function getApiFootballLeagueConfig() {
  return getConfig();
}

export async function fetchLeagueFixturesInRange(params: {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}): Promise<ApiFootballFixture[]> {
  const { leagueId, season } = getConfig();
  const rows = await apiGet<
    Array<{
      fixture: { id: number; date: string; status: { short: string } };
      teams: {
        home: { id: number; name: string };
        away: { id: number; name: string };
      };
    }>
  >("/fixtures", {
    league: leagueId,
    season,
    from: params.from,
    to: params.to,
  });

  return rows.map((row) => ({
    fixtureId: row.fixture.id,
    kickoffAt: row.fixture.date,
    home: { id: row.teams.home.id, name: row.teams.home.name },
    away: { id: row.teams.away.id, name: row.teams.away.name },
    statusShort: row.fixture.status.short,
  }));
}

export async function fetchFixturePrediction(
  fixtureId: number,
): Promise<ApiFootballPrediction | null> {
  const rows = await apiGet<
    Array<{
      predictions?: {
        winner?: { name?: string | null; comment?: string | null };
        win_or_draw?: boolean;
        under_over?: string | null;
        goals?: { home?: string | null; away?: string | null };
        advice?: string | null;
        percent?: {
          home?: string | null;
          draw?: string | null;
          away?: string | null;
        };
      };
    }>
  >("/predictions", { fixture: fixtureId });

  const row = rows[0];
  if (!row?.predictions) return null;

  const p = row.predictions;
  return {
    fixtureId,
    winnerName: p.winner?.name ?? null,
    winnerComment: p.winner?.comment ?? null,
    winOrDraw: p.win_or_draw ?? null,
    underOver: p.under_over ?? null,
    goalsHome: p.goals?.home ?? null,
    goalsAway: p.goals?.away ?? null,
    advice: p.advice ?? null,
    percentHome: parsePercent(p.percent?.home),
    percentDraw: parsePercent(p.percent?.draw),
    percentAway: parsePercent(p.percent?.away),
    raw: row,
  };
}

function parsePercent(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace("%", "").trim());
  return Number.isFinite(n) ? n : null;
}

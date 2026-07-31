/**
 * Minimal API-Football client for match previews.
 * Supports both API-Sports dashboard keys and RapidAPI keys.
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
  message?: string;
  response?: T;
};

type Provider = "apisports" | "rapidapi";

function getConfig() {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key) {
    throw new Error("API_FOOTBALL_KEY tanımlı değil.");
  }

  const providerEnv = process.env.API_FOOTBALL_PROVIDER?.trim().toLowerCase();
  const baseUrlEnv = process.env.API_FOOTBALL_BASE_URL?.trim();

  let provider: Provider = "apisports";
  if (providerEnv === "rapidapi" || providerEnv === "rapid") {
    provider = "rapidapi";
  } else if (
    baseUrlEnv?.includes("rapidapi.com") ||
    baseUrlEnv?.includes("rapidapi")
  ) {
    provider = "rapidapi";
  }

  const baseUrl = (
    baseUrlEnv ||
    (provider === "rapidapi"
      ? "https://api-football-v1.p.rapidapi.com/v3"
      : "https://v3.football.api-sports.io")
  ).replace(/\/$/, "");

  const leagueId = Number(process.env.API_FOOTBALL_LEAGUE_ID ?? "203");
  const season = Number(
    process.env.API_FOOTBALL_SEASON ?? new Date().getUTCFullYear(),
  );
  return { key, baseUrl, leagueId, season, provider };
}

function authHeaders(
  key: string,
  provider: Provider,
  baseUrl: string,
): Record<string, string> {
  if (provider === "rapidapi") {
    let host = process.env.API_FOOTBALL_RAPIDAPI_HOST?.trim();
    if (!host) {
      try {
        host = new URL(baseUrl).host;
      } catch {
        host = "api-football-v1.p.rapidapi.com";
      }
    }
    return {
      "x-rapidapi-key": key,
      "x-rapidapi-host": host,
    };
  }
  return {
    "x-apisports-key": key,
  };
}

async function apiGet<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  const { key, baseUrl, provider } = getConfig();
  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: authHeaders(key, provider, baseUrl),
    cache: "no-store",
  });

  const text = await res.text();
  let body: ApiEnvelope<T> | null = null;
  try {
    body = text ? (JSON.parse(text) as ApiEnvelope<T>) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const detail =
      body?.message ||
      (body?.errors ? JSON.stringify(body.errors) : null) ||
      text.slice(0, 240) ||
      res.statusText;
    if (res.status === 403) {
      throw new Error(
        `API-Football HTTP 403 — key/provider uyuşmuyor veya güvenlik engeli. ` +
          `Dashboard key ise API_FOOTBALL_PROVIDER=apisports + base api-sports.io; ` +
          `RapidAPI key ise API_FOOTBALL_PROVIDER=rapidapi. Detay: ${detail}`,
      );
    }
    throw new Error(`API-Football HTTP ${res.status}: ${detail}`);
  }

  if (body?.errors && Object.keys(body.errors as object).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(body.errors)}`);
  }

  return (body?.response ?? []) as T;
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

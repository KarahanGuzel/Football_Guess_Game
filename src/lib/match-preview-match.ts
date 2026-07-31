import type { ApiFootballFixture } from "@/lib/api-football";
import type { MatchWithTeams } from "@/types/database";

/** Normalize club names for fuzzy matching against API-Football labels. */
export function normalizeTeamKey(name: string): string {
  return name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const LOCAL_ALIASES: Record<string, string[]> = {
  fenerbahce: ["fenerbahce", "fenerbahce sk"],
  galatasaray: ["galatasaray", "galatasaray sk"],
  besiktas: ["besiktas", "besiktas jk"],
  trabzonspor: ["trabzonspor"],
  basaksehir: [
    "basaksehir",
    "istanbul basaksehir",
    "istanbul basak sehir",
    "istanbul basaksehir fk",
  ],
  goztepe: ["goztepe", "goztepe sk"],
};

function aliasKeysForLocalName(name: string): string[] {
  const key = normalizeTeamKey(name);
  const bare = key
    .replace(/\bsk\b/g, "")
    .replace(/\bfk\b/g, "")
    .replace(/\bjk\b/g, "")
    .replace(/\bistanbul\b/g, "")
    .trim()
    .replace(/\s+/g, " ");

  for (const [canonical, aliases] of Object.entries(LOCAL_ALIASES)) {
    if (
      bare === canonical ||
      key === canonical ||
      aliases.includes(key) ||
      aliases.includes(bare)
    ) {
      return aliases;
    }
  }
  return [key, bare].filter(Boolean);
}

export function teamNamesMatch(localName: string, apiName: string): boolean {
  const apiKey = normalizeTeamKey(apiName);
  const aliases = aliasKeysForLocalName(localName);
  return aliases.some(
    (alias) =>
      apiKey === alias || apiKey.includes(alias) || alias.includes(apiKey),
  );
}

export function findFixtureForMatch(
  match: MatchWithTeams,
  fixtures: ApiFootballFixture[],
): ApiFootballFixture | null {
  const kickoffMs = new Date(match.kickoff_at).getTime();
  const candidates = fixtures.filter(
    (f) =>
      teamNamesMatch(match.home_team.name, f.home.name) &&
      teamNamesMatch(match.away_team.name, f.away.name),
  );
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) =>
      Math.abs(new Date(a.kickoffAt).getTime() - kickoffMs) -
      Math.abs(new Date(b.kickoffAt).getTime() - kickoffMs),
  );
  const best = candidates[0];
  const diffH =
    Math.abs(new Date(best.kickoffAt).getTime() - kickoffMs) / (1000 * 60 * 60);
  if (diffH > 36) return null;
  return best;
}

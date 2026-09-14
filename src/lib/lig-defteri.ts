import { actualResult } from "@/lib/scoring";
import { weekIndexFromLabel } from "@/lib/week-label";
import type { GoalsMarket, PredictResult } from "@/types/database";

export const LIG_DEFTERI_SLOT_COUNT = 5;

export type DefteriMatch = {
  id: string;
  weekLabel: string;
  homeName: string;
  awayName: string;
  isDerby: boolean;
  isBonus: boolean;
  homeGoals: number | null;
  awayGoals: number | null;
};

export type DefteriPick = {
  matchId: string;
  playerId: string;
  playerName: string;
  result: PredictResult;
  goalsMarket: GoalsMarket;
  resultCorrect: boolean | null;
  pointsEarned: number | null;
};

export type DefteriStanding = {
  playerName: string;
  totalPoints: number;
  correctResultCount: number;
  correctGoalsCount: number;
  derbyCorrectCount: number;
  perfectPredictionCount: number;
};

export type DefteriKing = {
  weekLabel: string;
  kingNames: string[];
  points: number;
};

export type LigDefteriInput = {
  currentWeekLabel: string | null;
  currentMatches: DefteriMatch[];
  currentPicks: DefteriPick[];
  scoredWeeks: {
    label: string;
    matches: DefteriMatch[];
    picks: DefteriPick[];
  }[];
  standings?: DefteriStanding[];
  weekKings?: DefteriKing[];
};

export type LigDefteriStory = {
  id: string;
  priority: number;
  kicker: string;
  headline: string;
  detail: string | null;
};

export type LigDefteriEntry = {
  id: string;
  kicker: string;
  headline: string;
  detail: string | null;
};

export type LigDefteriSlot = {
  mode: "auto" | "custom";
  autoStoryId: string | null;
  kicker: string;
  headline: string;
  detail: string;
};

export type LigDefteriSettings = {
  slots: LigDefteriSlot[];
};

export type LigDefteriCard = {
  entries: LigDefteriEntry[];
};

const MIN_GROUP = 3;

export function emptyLigDefteriSlot(): LigDefteriSlot {
  return {
    mode: "auto",
    autoStoryId: null,
    kicker: "",
    headline: "",
    detail: "",
  };
}

export function defaultLigDefteriSettings(): LigDefteriSettings {
  return {
    slots: Array.from({ length: LIG_DEFTERI_SLOT_COUNT }, () =>
      emptyLigDefteriSlot(),
    ),
  };
}

export function parseLigDefteriSettings(value: unknown): LigDefteriSettings {
  const fallback = defaultLigDefteriSettings();
  if (!value || typeof value !== "object") return fallback;
  const slotsRaw = (value as { slots?: unknown }).slots;
  if (!Array.isArray(slotsRaw)) return fallback;

  const slots = fallback.slots.map((slot, index) => {
    const raw = slotsRaw[index];
    if (!raw || typeof raw !== "object") return slot;
    const row = raw as Partial<LigDefteriSlot>;
    const mode: LigDefteriSlot["mode"] = row.mode === "custom" ? "custom" : "auto";
    const next: LigDefteriSlot = {
      mode,
      autoStoryId:
        typeof row.autoStoryId === "string" && row.autoStoryId.trim()
          ? row.autoStoryId.trim()
          : null,
      kicker: typeof row.kicker === "string" ? row.kicker : "",
      headline: typeof row.headline === "string" ? row.headline : "",
      detail: typeof row.detail === "string" ? row.detail : "",
    };
    return next;
  });

  return { slots };
}

function weekTag(label: string): string {
  const n = weekIndexFromLabel(label);
  return n != null ? `${n}. hafta` : label;
}

function matchLine(match: DefteriMatch): string {
  return `${match.homeName}–${match.awayName}`;
}

function resultName(match: DefteriMatch, result: PredictResult): string {
  if (result === "home") return match.homeName;
  if (result === "away") return match.awayName;
  return "beraberlik";
}

function picksForMatch(picks: DefteriPick[], matchId: string): DefteriPick[] {
  const seen = new Set<string>();
  const rows: DefteriPick[] = [];
  for (const pick of picks) {
    if (pick.matchId !== matchId) continue;
    if (seen.has(pick.playerId)) continue;
    seen.add(pick.playerId);
    rows.push(pick);
  }
  return rows;
}

function resultTally(picks: DefteriPick[]): Map<PredictResult, DefteriPick[]> {
  const tally = new Map<PredictResult, DefteriPick[]>([
    ["home", []],
    ["draw", []],
    ["away", []],
  ]);
  for (const pick of picks) {
    tally.get(pick.result)!.push(pick);
  }
  return tally;
}

function overShare(picks: DefteriPick[]): number | null {
  if (picks.length < MIN_GROUP) return null;
  const over = picks.filter((p) => p.goalsMarket === "over_25").length;
  return over / picks.length;
}

function uniqueStories(stories: LigDefteriStory[]): LigDefteriStory[] {
  const seen = new Set<string>();
  const out: LigDefteriStory[] = [];
  for (const story of stories.sort(
    (a, b) => a.priority - b.priority || a.id.localeCompare(b.id),
  )) {
    if (seen.has(story.id)) continue;
    seen.add(story.id);
    out.push(story);
  }
  return out;
}

function currentWeekStories(input: LigDefteriInput): LigDefteriStory[] {
  if (!input.currentWeekLabel || input.currentMatches.length === 0) return [];
  const kicker = "Bu hafta";
  const stories: LigDefteriStory[] = [];

  for (const match of input.currentMatches) {
    if (match.isDerby) {
      stories.push({
        id: `derby-up-${match.id}`,
        priority: 42,
        kicker,
        headline: `Derbi: ${matchLine(match)}.`,
        detail: null,
      });
    }

    const rows = picksForMatch(input.currentPicks, match.id);
    if (rows.length < MIN_GROUP) continue;
    const tally = resultTally(rows);
    const ranked = [...tally.entries()].sort((a, b) => b[1].length - a[1].length);
    const [topResult, topRows] = ranked[0];
    const minority = ranked.filter(([, group]) => group.length > 0).slice(1);

    if (topRows.length === rows.length) {
      stories.push({
        id: `unanimous-${match.id}`,
        priority: match.isDerby ? 10 : 20,
        kicker,
        headline: `Herkes ${resultName(match, topResult)} dedi.`,
        detail: matchLine(match),
      });
      continue;
    }

    if (minority.length === 1 && minority[0][1].length === 1) {
      const loner = minority[0][1][0];
      stories.push({
        id: `loner-${match.id}`,
        priority: 30,
        kicker,
        headline: `Sadece ${loner.playerName} ${resultName(match, loner.result)} dedi.`,
        detail: matchLine(match),
      });
    } else if (match.isDerby) {
      const homeN = tally.get("home")!.length;
      const awayN = tally.get("away")!.length;
      const drawN = tally.get("draw")!.length;
      const split =
        drawN > 0
          ? `${match.homeName} ${homeN} · berabere ${drawN} · ${match.awayName} ${awayN}`
          : `${match.homeName} ${homeN} · ${match.awayName} ${awayN}`;
      stories.push({
        id: `derby-split-${match.id}`,
        priority: 40,
        kicker,
        headline: "Derbi ikiye bölündü.",
        detail: split,
      });
    }
  }

  const over = overShare(input.currentPicks);
  if (over != null && (over >= 0.65 || over <= 0.35)) {
    const pct = Math.round((over >= 0.5 ? over : 1 - over) * 100);
    const side = over >= 0.5 ? "üst" : "alt";
    stories.push({
      id: "current-ou",
      priority: 80,
      kicker,
      headline: `Küpürlerin %${pct}’i ${side}.`,
      detail: null,
    });
  }

  return stories;
}

function lastScoredStories(input: LigDefteriInput): LigDefteriStory[] {
  const last = input.scoredWeeks[input.scoredWeeks.length - 1];
  if (!last) return [];
  const kicker = weekTag(last.label);
  const stories: LigDefteriStory[] = [];

  for (const match of last.matches) {
    if (match.homeGoals == null || match.awayGoals == null) continue;
    const rows = picksForMatch(last.picks, match.id);
    if (rows.length < MIN_GROUP) continue;
    const hits = rows.filter((p) => p.resultCorrect === true);
    const winner = resultName(
      match,
      actualResult(match.homeGoals, match.awayGoals),
    );

    if (hits.length === 0) {
      stories.push({
        id: `nobody-${match.id}`,
        priority: 50,
        kicker,
        headline: `Kimse ${winner} dememişti.`,
        detail: matchLine(match),
      });
    } else if (hits.length === 1) {
      stories.push({
        id: `only-hit-${match.id}`,
        priority: 55,
        kicker,
        headline: `Sadece ${hits[0].playerName} ${winner} tutturdu.`,
        detail: matchLine(match),
      });
    }
  }

  return stories;
}

function seasonStories(input: LigDefteriInput): LigDefteriStory[] {
  const stories: LigDefteriStory[] = [];
  const bonusHits = new Map<string, { name: string; count: number }>();
  const allPicks: DefteriPick[] = [];

  for (const week of input.scoredWeeks) {
    const matchById = new Map(week.matches.map((m) => [m.id, m]));
    const weekPoints = new Map<string, { name: string; points: number }>();

    for (const pick of week.picks) {
      allPicks.push(pick);
      const match = matchById.get(pick.matchId);
      if (match?.isBonus && pick.pointsEarned === 6) {
        const current = bonusHits.get(pick.playerId);
        if (current) current.count += 1;
        else bonusHits.set(pick.playerId, { name: pick.playerName, count: 1 });
      }
      if (pick.pointsEarned != null) {
        const row = weekPoints.get(pick.playerId);
        if (row) row.points += pick.pointsEarned;
        else {
          weekPoints.set(pick.playerId, {
            name: pick.playerName,
            points: pick.pointsEarned,
          });
        }
      }
    }

    const ranked = [...weekPoints.values()].sort((a, b) => b.points - a.points);
    if (ranked.length >= 2) {
      const gap = ranked[0].points - ranked[1].points;
      if (gap <= 1) {
        stories.push({
          id: `tight-${week.label}`,
          priority: 90,
          kicker: weekTag(week.label),
          headline: `${weekTag(week.label)} 1 puana kaldı.`,
          detail: `${ranked[0].name} ${ranked[0].points} · ${ranked[1].name} ${ranked[1].points}`,
        });
      }
    }
  }

  const bonusRanked = [...bonusHits.values()].sort((a, b) => b.count - a.count);
  if (bonusRanked[0] && bonusRanked[0].count >= 2) {
    const leader = bonusRanked[0];
    const tied = bonusRanked.filter((row) => row.count === leader.count);
    if (tied.length === 1) {
      stories.push({
        id: "bonus-hero",
        priority: 70,
        kicker: "Sezon",
        headline: `Bonus tam isabet: ${leader.name}.`,
        detail: `${leader.count} tam isabet`,
      });
    }
  }

  const over = overShare(allPicks);
  if (over != null && (over >= 0.65 || over <= 0.35)) {
    const pct = Math.round((over >= 0.5 ? over : 1 - over) * 100);
    const side = over >= 0.5 ? "üst" : "alt";
    stories.push({
      id: "season-ou",
      priority: 100,
      kicker: "Sezon",
      headline: `Sezonun %${pct}’i ${side} gitmiş.`,
      detail: null,
    });
  }

  if (input.scoredWeeks.length > 0) {
    stories.push({
      id: "weeks-played",
      priority: 260,
      kicker: "Sezon",
      headline: `${input.scoredWeeks.length} hafta geride kaldı.`,
      detail: null,
    });
  }

  return stories;
}

function standingStories(input: LigDefteriInput): LigDefteriStory[] {
  const rows = [...(input.standings ?? [])].filter((row) => row.totalPoints > 0);
  if (rows.length === 0) return [];
  const stories: LigDefteriStory[] = [];
  const byPoints = [...rows].sort((a, b) => b.totalPoints - a.totalPoints);
  const leader = byPoints[0];
  stories.push({
    id: "table-leader",
    priority: 200,
    kicker: "Sezon",
    headline: `${leader.playerName} önde · ${leader.totalPoints}p.`,
    detail: null,
  });

  const byResult = [...rows].sort(
    (a, b) => b.correctResultCount - a.correctResultCount,
  );
  if (byResult[0] && byResult[0].correctResultCount > 0) {
    stories.push({
      id: "most-results",
      priority: 210,
      kicker: "Sezon",
      headline: `En çok taraf: ${byResult[0].playerName}.`,
      detail: `${byResult[0].correctResultCount} isabet`,
    });
  }

  const byGoals = [...rows].sort(
    (a, b) => b.correctGoalsCount - a.correctGoalsCount,
  );
  if (byGoals[0] && byGoals[0].correctGoalsCount > 0) {
    stories.push({
      id: "most-ou",
      priority: 220,
      kicker: "Sezon",
      headline: `Alt/üst: ${byGoals[0].playerName}.`,
      detail: `${byGoals[0].correctGoalsCount} isabet`,
    });
  }

  const byDerby = [...rows].sort(
    (a, b) => b.derbyCorrectCount - a.derbyCorrectCount,
  );
  if (byDerby[0] && byDerby[0].derbyCorrectCount > 0) {
    stories.push({
      id: "derby-sniper",
      priority: 230,
      kicker: "Sezon",
      headline: `Derbi isabeti: ${byDerby[0].playerName}.`,
      detail: `${byDerby[0].derbyCorrectCount} strike`,
    });
  }

  const byPerfect = [...rows].sort(
    (a, b) => b.perfectPredictionCount - a.perfectPredictionCount,
  );
  if (byPerfect[0] && byPerfect[0].perfectPredictionCount > 0) {
    stories.push({
      id: "strike-king",
      priority: 240,
      kicker: "Sezon",
      headline: `Strike: ${byPerfect[0].playerName}.`,
      detail: `${byPerfect[0].perfectPredictionCount} tam isabet`,
    });
  }

  const lastKing = input.weekKings?.[input.weekKings.length - 1];
  if (lastKing && lastKing.kingNames.length > 0) {
    stories.push({
      id: "last-king",
      priority: 250,
      kicker: weekTag(lastKing.weekLabel),
      headline: `Son kral: ${lastKing.kingNames.join(", ")}.`,
      detail: `${lastKing.points} puan`,
    });
  }

  return stories;
}

export function listLigDefteriStories(input: LigDefteriInput): LigDefteriStory[] {
  return uniqueStories([
    ...currentWeekStories(input),
    ...lastScoredStories(input),
    ...seasonStories(input),
    ...standingStories(input),
  ]);
}

export function composeLigDefteriEntries(
  stories: LigDefteriStory[],
  settings: LigDefteriSettings = defaultLigDefteriSettings(),
): LigDefteriEntry[] {
  const pool = [...stories];
  const used = new Set<string>();
  const entries: LigDefteriEntry[] = [];

  function takeAuto(preferredId: string | null): LigDefteriStory | null {
    if (preferredId) {
      const pinned = pool.find((story) => story.id === preferredId);
      if (pinned && !used.has(pinned.id)) {
        used.add(pinned.id);
        return pinned;
      }
    }
    const next = pool.find((story) => !used.has(story.id));
    if (!next) return null;
    used.add(next.id);
    return next;
  }

  for (const slot of settings.slots.slice(0, LIG_DEFTERI_SLOT_COUNT)) {
    if (slot.mode === "custom") {
      const headline = slot.headline.trim();
      if (!headline) continue;
      entries.push({
        id: `custom-${entries.length}`,
        kicker: slot.kicker.trim() || "Not",
        headline,
        detail: slot.detail.trim() || null,
      });
      continue;
    }
    const story = takeAuto(slot.autoStoryId);
    if (!story) continue;
    entries.push({
      id: story.id,
      kicker: story.kicker,
      headline: story.headline,
      detail: story.detail,
    });
  }

  while (entries.length < LIG_DEFTERI_SLOT_COUNT) {
    const story = takeAuto(null);
    if (!story) break;
    entries.push({
      id: story.id,
      kicker: story.kicker,
      headline: story.headline,
      detail: story.detail,
    });
  }

  return entries.slice(0, LIG_DEFTERI_SLOT_COUNT);
}

export function buildLigDefteri(
  input: LigDefteriInput,
  settings: LigDefteriSettings = defaultLigDefteriSettings(),
): LigDefteriCard | null {
  const entries = composeLigDefteriEntries(
    listLigDefteriStories(input),
    settings,
  );
  if (entries.length === 0) return null;
  return { entries };
}

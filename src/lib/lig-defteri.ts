import { actualResult } from "@/lib/scoring";
import { weekIndexFromLabel } from "@/lib/week-label";
import type { GoalsMarket, PredictResult } from "@/types/database";

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

export type LigDefteriInput = {
  currentWeekLabel: string | null;
  currentMatches: DefteriMatch[];
  currentPicks: DefteriPick[];
  scoredWeeks: {
    label: string;
    matches: DefteriMatch[];
    picks: DefteriPick[];
  }[];
};

export type LigDefteriChip = {
  label: string;
  value: string;
};

export type LigDefteriCard = {
  kicker: string;
  headline: string;
  detail: string | null;
  chips: LigDefteriChip[];
};

type Story = {
  id: string;
  priority: number;
  kicker: string;
  headline: string;
  detail: string | null;
  chip: LigDefteriChip;
};

const MIN_GROUP = 3;

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

function currentWeekStories(input: LigDefteriInput): Story[] {
  if (!input.currentWeekLabel || input.currentMatches.length === 0) return [];
  const kicker = "Bu hafta";
  const stories: Story[] = [];

  for (const match of input.currentMatches) {
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
        chip: { label: matchLine(match), value: `${rows.length}/${rows.length}` },
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
        chip: { label: "Tek küpür", value: loner.playerName },
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
        chip: { label: "Derbi", value: `${homeN}–${awayN}` },
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
      headline: `Bu hafta küpürlerin %${pct}’i ${side}.`,
      detail: null,
      chip: { label: `Bu hafta ${side}`, value: `%${pct}` },
    });
  }

  return stories;
}

function lastScoredStories(input: LigDefteriInput): Story[] {
  const last = input.scoredWeeks[input.scoredWeeks.length - 1];
  if (!last) return [];
  const kicker = weekTag(last.label);
  const stories: Story[] = [];

  for (const match of last.matches) {
    if (match.homeGoals == null || match.awayGoals == null) continue;
    const rows = picksForMatch(last.picks, match.id);
    if (rows.length < MIN_GROUP) continue;
    const hits = rows.filter((p) => p.resultCorrect === true);
    const winner = resultName(match, actualResult(match.homeGoals, match.awayGoals));

    if (hits.length === 0) {
      stories.push({
        id: `nobody-${match.id}`,
        priority: 50,
        kicker,
        headline: `Kimse ${winner} dememişti.`,
        detail: matchLine(match),
        chip: { label: "Kimse tutturamadı", value: match.homeName },
      });
    } else if (hits.length === 1) {
      stories.push({
        id: `only-hit-${match.id}`,
        priority: 55,
        kicker,
        headline: `Sadece ${hits[0].playerName} ${winner} tutturdu.`,
        detail: matchLine(match),
        chip: { label: "Tek isabet", value: hits[0].playerName },
      });
    }
  }

  return stories;
}

function seasonStories(input: LigDefteriInput): Story[] {
  const stories: Story[] = [];
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
        else weekPoints.set(pick.playerId, { name: pick.playerName, points: pick.pointsEarned });
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
          chip: { label: "En yakın", value: weekTag(week.label) },
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
        chip: { label: "Bonus", value: `${leader.name} ${leader.count}` },
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
      chip: { label: `Sezon ${side}`, value: `%${pct}` },
    });
  }

  return stories;
}

export function buildLigDefteri(input: LigDefteriInput): LigDefteriCard | null {
  const stories = [
    ...currentWeekStories(input),
    ...lastScoredStories(input),
    ...seasonStories(input),
  ].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

  const headline = stories[0];
  if (!headline) return null;

  const chips: LigDefteriChip[] = [];
  const used = new Set<string>([headline.chip.label + headline.chip.value]);
  for (const story of stories.slice(1)) {
    const key = story.chip.label + story.chip.value;
    if (used.has(key)) continue;
    used.add(key);
    chips.push(story.chip);
    if (chips.length === 3) break;
  }

  return {
    kicker: headline.kicker,
    headline: headline.headline,
    detail: headline.detail,
    chips,
  };
}

import { compareWeeksChronologically } from "@/lib/week-label";
import { effectiveWeekStatus } from "@/lib/week-lock";
import type { MatchWithTeams, Week } from "@/types/database";

export type AdminWeekBundle = {
  week: Week;
  matches: MatchWithTeams[];
};

export type AdminWeekSection = {
  id: "live" | "upcoming" | "scored";
  title: string;
  weeks: AdminWeekBundle[];
};

function firstKickoff(bundle: AdminWeekBundle): string {
  return bundle.matches[0]?.kickoff_at ?? bundle.week.created_at;
}

export function groupAdminWeekBundles(
  bundles: AdminWeekBundle[],
  now = new Date(),
): AdminWeekSection[] {
  const live: AdminWeekBundle[] = [];
  const upcoming: AdminWeekBundle[] = [];
  const scored: AdminWeekBundle[] = [];

  for (const bundle of bundles) {
    const status = effectiveWeekStatus(bundle.week, bundle.matches, now);
    if (status === "scored") scored.push(bundle);
    else if (status === "draft") upcoming.push(bundle);
    else live.push(bundle);
  }

  live.sort((a, b) => firstKickoff(a).localeCompare(firstKickoff(b)));
  upcoming.sort((a, b) => {
    const byLabel = compareWeeksChronologically(a.week, b.week);
    if (byLabel !== 0) return byLabel;
    return firstKickoff(a).localeCompare(firstKickoff(b));
  });
  scored.sort((a, b) => compareWeeksChronologically(b.week, a.week));

  return [
    { id: "live", title: "Yayında", weeks: live },
    { id: "upcoming", title: "Gelecek haftalar", weeks: upcoming },
    { id: "scored", title: "Puanlananlar", weeks: scored },
  ];
}

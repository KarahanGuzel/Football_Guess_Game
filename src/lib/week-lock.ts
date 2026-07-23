import type { Week, WeekStatus } from "@/types/database";

export function weekLockAt(matches: { kickoff_at: string }[]): Date | null {
  if (matches.length === 0) return null;
  const times = matches.map((m) => new Date(m.kickoff_at).getTime());
  return new Date(Math.min(...times));
}

export function isWeekLockedByTime(
  status: WeekStatus,
  matches: { kickoff_at: string }[],
  now = new Date(),
): boolean {
  if (status === "locked" || status === "scored") return true;
  const lockAt = weekLockAt(matches);
  return lockAt !== null && now >= lockAt;
}

export function effectiveWeekStatus(
  week: Pick<Week, "status">,
  matches: { kickoff_at: string }[],
  now = new Date(),
): WeekStatus {
  if (week.status === "scored") return "scored";
  if (isWeekLockedByTime(week.status, matches, now)) return "locked";
  return week.status;
}

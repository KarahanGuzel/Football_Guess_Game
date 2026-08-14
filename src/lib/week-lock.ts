import type { Week, WeekStatus } from "@/types/database";

/** Predictions lock this many ms before the first kickoff. */
export const WEEK_LOCK_LEAD_MS = 60 * 60 * 1000;

type WeekLockInput = Pick<Week, "status"> &
  Partial<Pick<Week, "bypass_time_lock">>;

export function weekLockAt(matches: { kickoff_at: string }[]): Date | null {
  if (matches.length === 0) return null;
  const times = matches.map((m) => new Date(m.kickoff_at).getTime());
  return new Date(Math.min(...times) - WEEK_LOCK_LEAD_MS);
}

export function isWeekLockedByTime(
  week: WeekLockInput,
  matches: { kickoff_at: string }[],
  now = new Date(),
): boolean {
  if (week.status === "locked" || week.status === "scored") return true;
  if (week.status === "open" && week.bypass_time_lock) return false;
  const lockAt = weekLockAt(matches);
  return lockAt !== null && now >= lockAt;
}

export function effectiveWeekStatus(
  week: WeekLockInput,
  matches: { kickoff_at: string }[],
  now = new Date(),
): WeekStatus {
  if (week.status === "scored") return "scored";
  if (isWeekLockedByTime(week, matches, now)) return "locked";
  return week.status;
}

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
  return isKickoffLockElapsed(matches, now);
}

/** True once the first-kickoff countdown has run out (ignores DB status). */
export function isKickoffLockElapsed(
  matches: { kickoff_at: string }[],
  now = new Date(),
): boolean {
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

/** Time-lock counts as locked, so admin can score without a separate lock click. */
export function canCalculateWeekPoints(
  week: WeekLockInput,
  matches: { kickoff_at: string }[],
  now = new Date(),
): boolean {
  if (week.status === "scored" || week.status === "draft") return false;
  if (week.status === "locked") return true;
  return isWeekLockedByTime(week, matches, now);
}

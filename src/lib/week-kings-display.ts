export const HOME_WEEK_KINGS_COUNT = 5;

/** Newest scored week first. */
export function orderWeekKingsLatestFirst<T>(rows: T[]): T[] {
  return [...rows].reverse();
}

export function compactWeekKings<T>(
  rows: T[],
  limit = HOME_WEEK_KINGS_COUNT,
): T[] {
  return orderWeekKingsLatestFirst(rows).slice(0, limit);
}

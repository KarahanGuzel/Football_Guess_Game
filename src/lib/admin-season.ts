import type { Week, WeekStatus } from "@/types/database";

const PLAYED_STATUSES: WeekStatus[] = ["open", "locked", "scored"];

export type SeasonWeek = Pick<Week, "id" | "label" | "status" | "created_at">;

export function sortWeeksBySeasonOrder<T extends { created_at: string }>(
  weeks: T[],
): T[] {
  return [...weeks].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** Later weeks that would leave a hole if this scored week were cleared. */
export function getLaterPlayedWeeks(
  week: SeasonWeek,
  allWeeks: SeasonWeek[],
): SeasonWeek[] {
  return sortWeeksBySeasonOrder(
    allWeeks.filter(
      (candidate) =>
        candidate.id !== week.id &&
        candidate.created_at > week.created_at &&
        PLAYED_STATUSES.includes(candidate.status),
    ),
  );
}

/**
 * Only the tip of the season can be cleared: no later open / locked / scored week.
 * Returns a Turkish reason when the button should stay inactive.
 */
export function getClearWeekBlockReason(
  week: SeasonWeek,
  allWeeks: SeasonWeek[],
): string | null {
  if (week.status !== "scored") {
    return "Sadece puanı hesaplanmış hafta temizlenebilir.";
  }

  const later = getLaterPlayedWeeks(week, allWeeks);
  if (later.length === 0) return null;

  const blocking = later[later.length - 1];
  if (blocking.status === "scored") {
    return `Önce ${blocking.label} temizlenmeli.`;
  }
  if (blocking.status === "open") {
    return `${blocking.label} hâlâ yayında. Sıra bozulmasın diye bu hafta temizlenemez.`;
  }
  return `${blocking.label} hâlâ kilitli. Sıra bozulmasın diye bu hafta temizlenemez.`;
}

export function canClearScoredWeek(
  week: SeasonWeek,
  allWeeks: SeasonWeek[],
): boolean {
  return getClearWeekBlockReason(week, allWeeks) === null;
}

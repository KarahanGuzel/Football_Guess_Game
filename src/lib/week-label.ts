/** "SüperLig 1.Hafta" → "01". Unknown shapes return null. */
export function weekNumberFromLabel(label: string): string | null {
  const match = label.match(/(\d+)\s*\.\s*Hafta/i);
  if (!match) return null;
  return match[1].padStart(2, "0");
}

/** Numeric week index from the label, or null. */
export function weekIndexFromLabel(label: string): number | null {
  const padded = weekNumberFromLabel(label);
  if (!padded) return null;
  const value = Number(padded);
  return Number.isFinite(value) ? value : null;
}

/** Season order by week number; falls back to created_at. */
export function compareWeeksChronologically(
  a: { label: string; created_at: string },
  b: { label: string; created_at: string },
): number {
  const na = weekIndexFromLabel(a.label);
  const nb = weekIndexFromLabel(b.label);
  if (na != null && nb != null && na !== nb) return na - nb;
  return a.created_at.localeCompare(b.created_at);
}

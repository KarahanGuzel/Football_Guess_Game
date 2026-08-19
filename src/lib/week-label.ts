/** "SüperLig 1.Hafta" → "01". Unknown shapes return null. */
export function weekNumberFromLabel(label: string): string | null {
  const match = label.match(/(\d+)\s*\.\s*Hafta/i);
  if (!match) return null;
  return match[1].padStart(2, "0");
}

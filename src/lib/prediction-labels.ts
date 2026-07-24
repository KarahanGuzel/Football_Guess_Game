import type { GoalsMarket, PredictResult } from "@/types/database";

export const resultLabel: Record<PredictResult, string> = {
  home: "MS 1",
  draw: "MS X",
  away: "MS 2",
};

export const goalsLabel: Record<GoalsMarket, string> = {
  under_25: "Alt 2.5",
  over_25: "Üst 2.5",
};

export function resultLabelForMatch(
  result: PredictResult,
  homeShort: string,
  awayShort: string,
): string {
  if (result === "home") return `${homeShort} kazanır`;
  if (result === "away") return `${awayShort} kazanır`;
  return "Berabere";
}

/**
 * Canonical scoring + derby helpers.
 * Keep in sync with SQL functions in supabase/migrations/20260723000000_init.sql
 * Spec: docs/ARCHITECTURE.md · examples: docs/SCORING_EXAMPLES.md
 */

export type PredictResult = 'home' | 'draw' | 'away';
export type GoalsMarket = 'under_25' | 'over_25';

export function actualResult(homeGoals: number, awayGoals: number): PredictResult {
  if (homeGoals > awayGoals) return 'home';
  if (homeGoals < awayGoals) return 'away';
  return 'draw';
}

export function actualGoalsMarket(homeGoals: number, awayGoals: number): GoalsMarket {
  return homeGoals + awayGoals > 2.5 ? 'over_25' : 'under_25';
}

export function detectDerby(homeIsDerbyClub: boolean, awayIsDerbyClub: boolean): boolean {
  return homeIsDerbyClub && awayIsDerbyClub;
}

export type ScoreInput = {
  result: PredictResult;
  goalsMarket: GoalsMarket;
  homeGoals: number;
  awayGoals: number;
  isBonus: boolean;
  isDerby: boolean;
};

export type ScoreOutput = {
  resultCorrect: boolean;
  goalsCorrect: boolean;
  pointsEarned: number;
};

/**
 * Point rules:
 * - Normal: result-only 2, O/U-only 1, both 4
 * - Derby: double normal points (never combined with bonus)
 * - Bonus: both correct → 6, else 0
 */
export function scorePrediction(input: ScoreInput): ScoreOutput {
  const resultCorrect = input.result === actualResult(input.homeGoals, input.awayGoals);
  const goalsCorrect =
    input.goalsMarket === actualGoalsMarket(input.homeGoals, input.awayGoals);

  if (input.isBonus) {
    if (input.isDerby) {
      throw new Error('BONUS_DERBY_CONFLICT');
    }
    return {
      resultCorrect,
      goalsCorrect,
      pointsEarned: resultCorrect && goalsCorrect ? 6 : 0,
    };
  }

  let points = 0;
  if (resultCorrect && goalsCorrect) points = 4;
  else if (resultCorrect) points = 2;
  else if (goalsCorrect) points = 1;

  if (input.isDerby) points *= 2;

  return { resultCorrect, goalsCorrect, pointsEarned: points };
}

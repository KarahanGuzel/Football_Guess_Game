import type { SlipCommentReaction } from "@/lib/slip-reactions";

export type PredictResult = "home" | "draw" | "away";
export type GoalsMarket = "under_25" | "over_25";
export type WeekStatus = "draft" | "open" | "locked" | "scored";
export type MatchStatus = "scheduled" | "finished";

export type Team = {
  id: string;
  name: string;
  short_name: string;
  is_derby_club: boolean;
  sort_order: number;
};

export type Player = {
  id: string;
  display_name: string;
  slug: string;
  is_admin: boolean;
  is_active: boolean;
};

export type Week = {
  id: string;
  label: string;
  status: WeekStatus;
  notes: string | null;
  created_at: string;
  /** After "Haftayı Temizle", kickoff lock is ignored until the week is scored. */
  bypass_time_lock: boolean;
};

export type Match = {
  id: string;
  week_id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_at: string;
  is_bonus: boolean;
  is_derby: boolean;
  home_goals: number | null;
  away_goals: number | null;
  status: MatchStatus;
};

export type MatchWithTeams = Match & {
  home_team: Team;
  away_team: Team;
};

export type Prediction = {
  id: string;
  player_id: string;
  match_id: string;
  result: PredictResult;
  goals_market: GoalsMarket;
  result_correct: boolean | null;
  goals_correct: boolean | null;
  points_earned: number | null;
};

/** Comment on a player's weekly prediction slip (küpür), not a single match. */
export type SlipComment = {
  id: string;
  week_id: string;
  target_player_id: string;
  author_player_id: string;
  body: string;
  created_at: string;
};

export type SlipCommentWithAuthor = SlipComment & {
  author: Player;
  reactions: SlipCommentReaction[];
};

export type StandingRow = {
  player_id: string;
  display_name: string;
  slug: string;
  total_points: number;
  weeks_played: number;
  correct_result_count: number;
  correct_goals_count: number;
  perfect_prediction_count: number;
  derby_correct_count: number;
  scored_prediction_count: number;
  success_percentage: number;
};

export type SessionData = {
  playerId?: string;
  displayName?: string;
  slug?: string;
  isAdmin?: boolean;
};

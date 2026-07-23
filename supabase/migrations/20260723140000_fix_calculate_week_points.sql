-- Fix calculate_week_points: cannot reference UPDATE target alias in FROM/LATERAL
create or replace function public.calculate_week_points(p_week_id uuid)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.matches m
    where m.week_id = p_week_id
      and (m.home_goals is null or m.away_goals is null)
  ) then
    raise exception 'SCORES_INCOMPLETE: all matches must have final scores';
  end if;

  update public.predictions as pr
  set
    result_correct = scored.result_correct,
    goals_correct = scored.goals_correct,
    points_earned = scored.points_earned,
    updated_at = now()
  from (
    select
      p.id as prediction_id,
      s.result_correct,
      s.goals_correct,
      s.points_earned
    from public.predictions p
    join public.matches m on m.id = p.match_id
    cross join lateral public.score_prediction(
      p.result,
      p.goals_market,
      m.home_goals,
      m.away_goals,
      m.is_bonus,
      m.is_derby
    ) s
    where m.week_id = p_week_id
  ) scored
  where pr.id = scored.prediction_id;

  update public.matches
  set status = 'finished',
      updated_at = now()
  where week_id = p_week_id;

  update public.weeks
  set status = 'scored',
      updated_at = now()
  where id = p_week_id;
end;
$$;

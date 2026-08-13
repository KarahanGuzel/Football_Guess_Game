-- Standings: weeks played + derby result hits
-- Recreate view (OR REPLACE cannot safely add columns).

drop view if exists public.standings;

create view public.standings
with (security_invoker = true)
as
select
  p.id as player_id,
  p.display_name,
  p.slug,
  coalesce(sum(pr.points_earned), 0)::int as total_points,
  count(distinct m.week_id) filter (
    where pr.points_earned is not null
  )::int as weeks_played,
  count(pr.id) filter (where pr.result_correct)::int as correct_result_count,
  count(pr.id) filter (where pr.goals_correct)::int as correct_goals_count,
  count(pr.id) filter (
    where pr.result_correct and pr.goals_correct
  )::int as perfect_prediction_count,
  count(pr.id) filter (
    where coalesce(m.is_derby, false) and pr.result_correct
  )::int as derby_correct_count,
  count(pr.id) filter (where pr.points_earned is not null)::int as scored_prediction_count,
  case
    when count(pr.id) filter (where pr.points_earned is not null) = 0 then 0::numeric
    else round(
      100.0
      * count(pr.id) filter (where pr.result_correct and pr.goals_correct)
      / nullif(count(pr.id) filter (where pr.points_earned is not null), 0),
      1
    )
  end as success_percentage
from public.players p
left join public.predictions pr
  on pr.player_id = p.id
 and pr.points_earned is not null
left join public.matches m
  on m.id = pr.match_id
where p.is_active
group by p.id, p.display_name, p.slug;

revoke all on table public.standings from anon, authenticated;

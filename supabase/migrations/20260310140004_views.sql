create or replace view public.daily_entry_dashboard_summary
with (security_invoker = on) as
select
  user_id,
  count(*) as total_days,
  avg(evening_mood)::numeric(5,2) as avg_evening_mood,
  avg(stress_level)::numeric(5,2) as avg_stress_level,
  avg(productivity_level)::numeric(5,2) as avg_productivity_level,
  avg(sleep_duration_hours)::numeric(5,2) as avg_sleep_duration_hours
from public.daily_entries
group by user_id;

create or replace view public.weekly_entry_dashboard_summary
with (security_invoker = on) as
select
  user_id,
  count(*) as total_weeks,
  avg(training_consistency)::numeric(5,2) as avg_training_consistency,
  avg(nutrition_consistency)::numeric(5,2) as avg_nutrition_consistency,
  avg(social_connection)::numeric(5,2) as avg_social_connection,
  avg(relationship_stability)::numeric(5,2) as avg_relationship_stability
from public.weekly_entries
group by user_id;

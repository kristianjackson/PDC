create index if not exists idx_daily_entries_user_date
  on public.daily_entries (user_id, entry_date desc);

create index if not exists idx_weekly_entries_user_date
  on public.weekly_entries (user_id, week_end_date desc);

create index if not exists idx_daily_entries_stress
  on public.daily_entries (user_id, stress_level);

create index if not exists idx_daily_entries_mood
  on public.daily_entries (user_id, evening_mood);

create index if not exists idx_daily_entries_sleep
  on public.daily_entries (user_id, sleep_duration_hours);

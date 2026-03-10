create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  sleep_duration_hours numeric(4,2),
  sleep_quality smallint check (sleep_quality between 1 and 10),
  wake_energy smallint check (wake_energy between 1 and 10),
  body_weight numeric(6,2),
  morning_mood smallint check (morning_mood between 1 and 10),
  evening_mood smallint check (evening_mood between 1 and 10),
  stress_level smallint check (stress_level between 1 and 10),
  productivity_level smallint check (productivity_level between 1 and 10),
  caffeine_count smallint not null default 0 check (caffeine_count >= 0),
  alcohol_count smallint not null default 0 check (alcohol_count >= 0),
  exercise_completed boolean not null default false,
  steps integer check (steps is null or steps >= 0),
  meditation_completed boolean not null default false,
  meaningful_social_contact boolean not null default false,
  conflict_level smallint check (conflict_level between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_entries_user_date_unique unique (user_id, entry_date)
);

create table if not exists public.weekly_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_end_date date not null,
  training_consistency smallint check (training_consistency between 1 and 10),
  nutrition_consistency smallint check (nutrition_consistency between 1 and 10),
  screen_time_estimate smallint check (screen_time_estimate between 0 and 10),
  inbox_pressure smallint check (inbox_pressure between 1 and 10),
  social_connection smallint check (social_connection between 1 and 10),
  relationship_stability smallint check (relationship_stability between 1 and 10),
  travel_week boolean not null default false,
  entertainment_load smallint check (entertainment_load between 0 and 10),
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_entries_user_date_unique unique (user_id, week_end_date)
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_daily_entries_updated_at on public.daily_entries;
create trigger set_daily_entries_updated_at
before update on public.daily_entries
for each row
execute function public.handle_updated_at();

drop trigger if exists set_weekly_entries_updated_at on public.weekly_entries;
create trigger set_weekly_entries_updated_at
before update on public.weekly_entries
for each row
execute function public.handle_updated_at();

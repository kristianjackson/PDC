alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;
alter table public.weekly_entries enable row level security;

alter table public.profiles force row level security;
alter table public.daily_entries force row level security;
alter table public.weekly_entries force row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists daily_entries_select_own on public.daily_entries;
create policy daily_entries_select_own
on public.daily_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists daily_entries_insert_own on public.daily_entries;
create policy daily_entries_insert_own
on public.daily_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists daily_entries_update_own on public.daily_entries;
create policy daily_entries_update_own
on public.daily_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists daily_entries_delete_own on public.daily_entries;
create policy daily_entries_delete_own
on public.daily_entries
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists weekly_entries_select_own on public.weekly_entries;
create policy weekly_entries_select_own
on public.weekly_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists weekly_entries_insert_own on public.weekly_entries;
create policy weekly_entries_insert_own
on public.weekly_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists weekly_entries_update_own on public.weekly_entries;
create policy weekly_entries_update_own
on public.weekly_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists weekly_entries_delete_own on public.weekly_entries;
create policy weekly_entries_delete_own
on public.weekly_entries
for delete
to authenticated
using (auth.uid() = user_id);

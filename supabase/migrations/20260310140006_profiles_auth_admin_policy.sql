drop policy if exists profiles_manage_system on public.profiles;
create policy profiles_manage_system
on public.profiles
for all
to supabase_auth_admin
using (true)
with check (true);

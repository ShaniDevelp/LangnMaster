-- Fix circular RLS policies. Run in Supabase Dashboard > SQL Editor.

-- Drop all broken policies
drop policy if exists "admin_all_profiles" on public.profiles;
drop policy if exists "admin_all_courses" on public.courses;
drop policy if exists "admin_all_enrollments" on public.enrollments;
drop policy if exists "admin_all_groups" on public.groups;
drop policy if exists "admin_all_group_members" on public.group_members;
drop policy if exists "admin_all_sessions" on public.sessions;
drop policy if exists "groups_select" on public.groups;
drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "sessions_select" on public.sessions;

-- Security definer function: checks admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Non-circular group/session policies
create policy "groups_select" on public.groups
  for select using (auth.role() = 'authenticated');

create policy "group_members_select" on public.group_members
  for select using (auth.role() = 'authenticated');

create policy "sessions_select" on public.sessions
  for select using (auth.role() = 'authenticated');

-- Admin policies using the security definer function (no recursion)
create policy "admin_all_profiles" on public.profiles
  for all using (public.is_admin());

create policy "admin_all_courses" on public.courses
  for all using (public.is_admin());

create policy "admin_all_enrollments" on public.enrollments
  for all using (public.is_admin());

create policy "admin_all_groups" on public.groups
  for all using (public.is_admin());

create policy "admin_all_group_members" on public.group_members
  for all using (public.is_admin());

create policy "admin_all_sessions" on public.sessions
  for all using (public.is_admin());

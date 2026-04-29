-- Add admin role support
alter table public.profiles
  drop constraint profiles_role_check,
  add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));

-- Admin can read/write everything
create policy "admin_all_profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_all_courses" on public.courses
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_all_enrollments" on public.enrollments
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_all_groups" on public.groups
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_all_group_members" on public.group_members
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_all_sessions" on public.sessions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Promote a user to admin (run this manually with the user's email)
-- update public.profiles set role = 'admin' where id = (
--   select id from auth.users where email = 'admin@example.com'
-- );

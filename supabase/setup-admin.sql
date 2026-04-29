-- Run this in Supabase Dashboard > SQL Editor

-- 1. Allow 'admin' as a valid role (required before step 2)
alter table public.profiles
  drop constraint if exists profiles_role_check,
  add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));

-- 2. Promote the admin user
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@langmaster.com'
);

-- 3. Verify (should show role = admin)
select p.id, p.name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@langmaster.com';

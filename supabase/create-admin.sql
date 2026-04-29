-- Create admin user in Supabase Auth then set profile role to admin.
-- Run in Supabase Dashboard > SQL Editor.

-- Step 1: Create the auth user
-- (Supabase doesn't let you insert directly into auth.users via SQL easily,
--  so use the Supabase Admin API or signup flow, then run Step 2.)

-- After the user signs up or is created, promote them to admin:
-- Replace the email below with your admin email.

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@langmaster.com'
);

-- Verify:
select p.id, p.name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@langmaster.com';

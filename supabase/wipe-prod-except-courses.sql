-- DESTRUCTIVE: wipes ALL data from prod EXCEPT courses + course_modules.
-- Relies on ON DELETE CASCADE chains:
--   DELETE groups     -> sessions, conversations, messages, group_members,
--                        group_action_requests, session_attendance
--   DELETE auth.users -> profiles -> enrollments, course_teachers, notifications,
--                        reviews, teacher_applications, teacher_payouts,
--                        teacher_unavailability, signaling, conversation_participants
-- courses + course_modules have NO FK to users -> untouched.

BEGIN;

DELETE FROM public.groups;
DELETE FROM public.conversations;  -- DM convos have group_id NULL, not caught by group cascade
DELETE FROM auth.users;

COMMIT;

-- verify
SELECT 'courses' t, count(*) FROM public.courses
UNION ALL SELECT 'course_modules', count(*) FROM public.course_modules
UNION ALL SELECT 'auth.users', count(*) FROM auth.users
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'enrollments', count(*) FROM public.enrollments
UNION ALL SELECT 'groups', count(*) FROM public.groups
UNION ALL SELECT 'sessions', count(*) FROM public.sessions
UNION ALL SELECT 'messages', count(*) FROM public.messages
ORDER BY 1;

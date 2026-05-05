-- ============================================================
-- LangMaster — Full Data Cleanup Script
-- ============================================================
-- Run this in Supabase SQL Editor to wipe ALL user data.
-- Tables from schema.sql + all migration files are covered.
-- COURSES are preserved (they are configuration, not user data).
-- ============================================================

-- ── Step 0: Delete Auth Users via SQL ───────────────────────
-- The Supabase dashboard DELETE button fails with a NULL
-- confirmation_token bug. Use this SQL instead.
--
-- Option A: Delete ALL auth users
delete from auth.users;
--
-- Option B: Delete specific user by UUID
-- delete from auth.users where id = 'PASTE-UUID-HERE';
--
-- Deleting from auth.users cascades to public.profiles
-- automatically (via ON DELETE CASCADE on the FK).
-- ── ─────────────────────────────────────────────────────────

-- ── Phase 4/5 tables ────────────────────────────────────────
delete from public.group_action_requests;
delete from public.teacher_payouts;

-- ── Phase 3 tables ─────────────────────────────────────────
delete from public.notifications;
delete from public.teacher_unavailability;

-- ── Phase 2 tables ─────────────────────────────────────────
delete from public.session_attendance;

-- ── Stage 3 tables (reviews, teacher_profiles, course_teachers) ─
delete from public.reviews;
delete from public.course_teachers;

-- ── Core session + group tables ────────────────────────────
delete from public.signaling;
delete from public.sessions;
delete from public.group_members;
delete from public.groups;
delete from public.enrollments;

-- ── Teacher application data ────────────────────────────────
delete from public.teacher_applications;
delete from public.teacher_profiles;

-- ── Profiles (all users) ───────────────────────────────────
-- Must come after all FK-dependent tables above
delete from public.profiles;

-- ── Notification prefs reset (column on profiles) ──────────
-- Already gone with profiles delete above.

-- ============================================================
-- After running this SQL, go to:
--   Supabase Dashboard → Authentication → Users
-- Select all users and click Delete.
-- ============================================================

-- ── Optional: Reset course_modules if you want fresh curriculum ──
-- (Comment out if you want to keep curriculum data)
-- delete from public.course_modules;

-- ============================================================
-- DONE. Now re-run seed_test_data.sql to set up test data.
-- ============================================================

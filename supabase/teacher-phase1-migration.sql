-- Teacher Phase 1 Migration
-- Run this after stage3-migration.sql

-- Teacher application vetting table
create table if not exists public.teacher_applications (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null unique,
  languages_taught jsonb not null default '[]',  -- [{lang: string, proficiency: 'native'|'near_native'|'fluent'}]
  certifications  text[] default '{}',
  intro_video_url text,
  teaching_bio    text,
  availability    text[] default '{}',           -- same slot format as profiles: "mon-morning"
  timezone        text,
  rate_expectation numeric(10,2),
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  admin_notes     text,
  submitted_at    timestamptz default now(),
  reviewed_at     timestamptz
);

alter table public.teacher_applications enable row level security;

-- Teacher can read/insert/update own application
create policy "teacher_apps_select" on public.teacher_applications
  for select using (auth.uid() = user_id);
create policy "teacher_apps_insert" on public.teacher_applications
  for insert with check (auth.uid() = user_id);
create policy "teacher_apps_update_own" on public.teacher_applications
  for update using (auth.uid() = user_id);

-- Extend teacher_profiles with onboarding preferences (already created in stage3)
alter table public.teacher_profiles
  add column if not exists preferences jsonb default '{}',
  add column if not exists rate_per_session numeric(10,2) default 0;

-- Ensure profiles has onboarding_completed (may already exist from student onboarding migration)
alter table public.profiles
  add column if not exists onboarding_completed boolean default false;

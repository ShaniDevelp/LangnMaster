-- Teacher Phase 3 Migration
-- Schedule view, group detail, session history, public profile, ratings
-- Run after teacher-phase2-migration.sql

-- Teacher unavailability date overrides (blocks a normally available slot)
create table if not exists public.teacher_unavailability (
  id         uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  date       date not null,
  reason     text,
  unique(teacher_id, date)
);

alter table public.teacher_unavailability enable row level security;

create policy "unavail_owner_all" on public.teacher_unavailability
  for all using (auth.uid() = teacher_id);

-- Extend teacher_profiles with preferences + rate
alter table public.teacher_profiles
  add column if not exists rate_per_session numeric(10,2) default 25,
  add column if not exists preferences jsonb default '{}';

-- In-app notifications (shared table for teachers + students)
create table if not exists public.notifications (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references public.profiles(id) on delete cascade not null,
  type     text not null,
  payload  jsonb default '{}',
  sent_at  timestamptz default now(),
  read_at  timestamptz
);

alter table public.notifications enable row level security;

create policy "notif_owner_select" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notif_owner_update" on public.notifications
  for update using (auth.uid() = user_id);

-- Fast lookup by recipient
create index if not exists idx_notif_user on public.notifications(user_id, sent_at desc);

-- Allow teachers to see their own reviews
-- (reviews table already exists from stage3 migration)
-- Just confirm index on teacher_id
create index if not exists idx_reviews_teacher on public.reviews(teacher_id);

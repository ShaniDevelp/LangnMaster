-- Teacher Phase 4/5 Migration
-- Earnings/Payouts, Notification Prefs, Group Actions
-- Run after teacher-phase3-migration.sql

-- Teacher payouts tracking
create table if not exists public.teacher_payouts (
  id                 uuid default gen_random_uuid() primary key,
  teacher_id         uuid references public.profiles(id) on delete cascade not null,
  amount             numeric(10,2) not null,
  status             text default 'pending'
                       check (status in ('pending', 'processing', 'paid', 'failed')),
  payout_date        date,
  method             text,                       -- 'manual', 'bank_transfer', 'stripe_connect'
  stripe_transfer_id text,
  admin_notes        text,
  created_at         timestamptz default now()
);

alter table public.teacher_payouts enable row level security;

-- Teacher sees own payouts; service role used by admin API
create policy "payouts_teacher_select" on public.teacher_payouts
  for select using (auth.uid() = teacher_id);

create index if not exists idx_payouts_teacher on public.teacher_payouts(teacher_id, created_at desc);

-- Notification prefs on profiles
alter table public.profiles
  add column if not exists notification_prefs jsonb default '{}';

-- Group action requests (pause, reassignment, etc.)
create table if not exists public.group_action_requests (
  id          uuid default gen_random_uuid() primary key,
  group_id    uuid references public.groups(id) on delete cascade not null,
  teacher_id  uuid references public.profiles(id) on delete cascade not null,
  type        text not null check (type in ('pause', 'student_reassignment', 'other')),
  notes       text,
  status      text default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  created_at  timestamptz default now()
);

alter table public.group_action_requests enable row level security;

create policy "group_action_teacher_all" on public.group_action_requests
  for all using (auth.uid() = teacher_id);

-- Sessions: add started_at / ended_at if not present
alter table public.sessions
  add column if not exists started_at  timestamptz,
  add column if not exists ended_at    timestamptz;

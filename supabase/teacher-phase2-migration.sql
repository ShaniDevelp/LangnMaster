-- Teacher Phase 2 Migration
-- Pre-call lobby, post-call notes, attendance tracking
-- Run after teacher-phase1-migration.sql

-- Add session-level fields for topic prep, homework, and notes
alter table public.sessions
  add column if not exists topic         text,
  add column if not exists prep_notes    text,
  add column if not exists session_notes text,
  add column if not exists homework_text text,
  add column if not exists homework_url  text;

-- Attendance per-student per-session
create table if not exists public.session_attendance (
  id           uuid default gen_random_uuid() primary key,
  session_id   uuid references public.sessions(id)  on delete cascade not null,
  student_id   uuid references public.profiles(id)  on delete cascade not null,
  status       text not null default 'present'
                 check (status in ('present', 'late', 'no_show')),
  unique(session_id, student_id)
);

alter table public.session_attendance enable row level security;

-- Teacher can read/write attendance for their own sessions
create policy "attendance_teacher_all" on public.session_attendance
  for all using (
    exists (
      select 1 from public.sessions s
      join public.groups g on g.id = s.group_id
      where s.id = session_id and g.teacher_id = auth.uid()
    )
  );

-- Students can read their own attendance
create policy "attendance_student_select" on public.session_attendance
  for select using (auth.uid() = student_id);

-- Index for fast lookup by session
create index if not exists idx_attendance_session on public.session_attendance(session_id);

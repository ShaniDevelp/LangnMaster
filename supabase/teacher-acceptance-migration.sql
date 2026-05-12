-- Teacher acceptance loop
-- Adds an optional "proposed" state between admin approval and group activation.
-- Existing groups default to 'accepted' so they continue to behave as before.

alter table public.groups
  add column if not exists acceptance_status text not null default 'accepted'
    check (acceptance_status in ('pending_teacher', 'accepted', 'declined'));

alter table public.groups
  add column if not exists proposed_at timestamptz;

alter table public.groups
  add column if not exists responded_at timestamptz;

-- Tracks which teachers declined this proposal so admin can't re-assign the same teacher
alter table public.groups
  add column if not exists declined_teachers jsonb not null default '[]'::jsonb;

create index if not exists idx_groups_acceptance_pending
  on public.groups (teacher_id)
  where acceptance_status = 'pending_teacher';

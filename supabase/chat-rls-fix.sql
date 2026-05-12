-- Fix: self-referential RLS on conversation_participants causes infinite recursion.
-- Solution: SECURITY DEFINER function reads conversation_participants without RLS,
-- then all three policies use it instead of re-querying the protected table.

-- ── Helper: returns conversation IDs the current user is a participant in ─────
create or replace function public.my_conversation_ids()
returns setof uuid language sql security definer stable as $$
  select conversation_id
  from public.conversation_participants
  where user_id = auth.uid()
$$;

-- ── Re-create conversation_participants policies ───────────────────────────────
drop policy if exists "cp_participant_select" on public.conversation_participants;

create policy "cp_participant_select" on public.conversation_participants
  for select using (
    conversation_id in (select public.my_conversation_ids())
  );

-- ── Re-create conversations policy ────────────────────────────────────────────
drop policy if exists "conv_participant_select" on public.conversations;

create policy "conv_participant_select" on public.conversations
  for select using (
    id in (select public.my_conversation_ids())
  );

-- ── Re-create messages policy ─────────────────────────────────────────────────
drop policy if exists "msg_participant_select" on public.messages;

create policy "msg_participant_select" on public.messages
  for select using (
    conversation_id in (select public.my_conversation_ids())
  );

-- insert policy also used the same pattern — fix it too
drop policy if exists "msg_participant_insert" on public.messages;

create policy "msg_participant_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and conversation_id in (select public.my_conversation_ids())
  );

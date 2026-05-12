-- Missing DML policies that were not included in chat-rls-fix.sql.
-- Without these, markConversationRead and deleteMessage silently no-op.

-- conversation_participants: allow user to update their own row (last_read_at)
drop policy if exists "cp_participant_update" on public.conversation_participants;
create policy "cp_participant_update" on public.conversation_participants
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- messages: allow sender to soft-delete their own messages
drop policy if exists "msg_sender_update" on public.messages;
create policy "msg_sender_update" on public.messages
  for update using (
    sender_id = auth.uid()
    and conversation_id in (select public.my_conversation_ids())
  );

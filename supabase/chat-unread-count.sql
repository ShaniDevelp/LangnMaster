-- Efficient unread message count for current user across all conversations.
-- Single join query — avoids N+1 in server actions.

create or replace function public.get_unread_message_count()
returns bigint language sql security definer stable as $$
  select count(*)::bigint
  from public.messages m
  join public.conversation_participants cp
    on cp.conversation_id = m.conversation_id
   and cp.user_id = auth.uid()
  where m.sender_id != auth.uid()
    and m.deleted_at is null
    and m.created_at > coalesce(cp.last_read_at, '1970-01-01'::timestamptz)
$$;

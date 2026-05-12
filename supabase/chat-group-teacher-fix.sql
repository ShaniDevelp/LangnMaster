-- Fix: teacher not added to group conversation on group creation
-- Root cause: trg_add_teacher_to_group_conv fires before trg_group_conversation
-- (PostgreSQL fires triggers alphabetically: 'a' < 'g')
-- so the conversation doesn't exist yet when the teacher trigger runs.
--
-- Fix strategy:
--   1. create_group_conversation() now also inserts the teacher participant
--   2. add_teacher_to_group_conversation() restricted to UPDATE only (teacher reassignment)
--   3. Backfill existing groups where teacher was never added

-- ── 1. Fix create_group_conversation to also add teacher ─────────────────────

create or replace function public.create_group_conversation()
returns trigger language plpgsql security definer as $$
declare
  v_conv_id uuid;
begin
  insert into public.conversations (type, group_id)
  values ('group', NEW.id)
  on conflict do nothing
  returning id into v_conv_id;

  -- If conversation was just created and group has a teacher, add them as participant
  if v_conv_id is not null and NEW.teacher_id is not null then
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv_id, NEW.teacher_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$;

-- ── 2. Restrict teacher trigger to UPDATE only (handles teacher reassignment) ─

drop trigger if exists trg_add_teacher_to_group_conv on public.groups;
create trigger trg_add_teacher_to_group_conv
  after update of teacher_id on public.groups
  for each row execute function public.add_teacher_to_group_conversation();

-- ── 3. Backfill: add teachers to existing group conversations where missing ───

insert into public.conversation_participants (conversation_id, user_id)
select c.id, g.teacher_id
from public.groups g
join public.conversations c on c.group_id = g.id and c.type = 'group'
where g.teacher_id is not null
  and not exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = c.id
      and cp.user_id = g.teacher_id
  );

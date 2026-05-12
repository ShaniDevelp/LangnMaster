-- Chat Feature Migration
-- Adds: conversations, conversation_participants, messages tables
-- Storage buckets configured separately in Supabase dashboard
-- Run after teacher-phase4-5-migration.sql

-- ── Step 1: Create all tables first (no RLS policies yet) ────────────────────

create table if not exists public.conversations (
  id         uuid default gen_random_uuid() primary key,
  type       text not null check (type in ('direct', 'group')),
  group_id   uuid references public.groups(id) on delete cascade,
  created_at timestamptz default now()
);

create unique index if not exists idx_conversations_group
  on public.conversations(group_id)
  where group_id is not null;

create table if not exists public.conversation_participants (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  last_read_at    timestamptz default now(),
  joined_at       timestamptz default now(),
  unique(conversation_id, user_id)
);

create index if not exists idx_cp_user on public.conversation_participants(user_id);
create index if not exists idx_cp_conversation on public.conversation_participants(conversation_id);

create table if not exists public.messages (
  id               uuid default gen_random_uuid() primary key,
  conversation_id  uuid references public.conversations(id) on delete cascade not null,
  sender_id        uuid references public.profiles(id) on delete set null,
  type             text not null check (type in ('text', 'voice_note', 'file', 'image')) default 'text',
  content          text,
  file_url         text,
  file_name        text,
  file_size        bigint,
  mime_type        text,
  duration_seconds int,
  reply_to_id      uuid references public.messages(id) on delete set null,
  created_at       timestamptz default now(),
  deleted_at       timestamptz,
  constraint msg_has_body check (content is not null or file_url is not null)
);

create index if not exists idx_msg_conversation on public.messages(conversation_id, created_at desc);
create index if not exists idx_msg_sender on public.messages(sender_id);

-- ── Step 2: Enable RLS on all three tables ───────────────────────────────────

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- ── Step 3: RLS policies (conversation_participants now exists) ──────────────

-- conversations: users see only those they participate in
create policy "conv_participant_select" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- conversation_participants: see rows of conversations you're in
create policy "cp_participant_select" on public.conversation_participants
  for select using (
    exists (
      select 1 from public.conversation_participants cp2
      where cp2.conversation_id = conversation_participants.conversation_id
        and cp2.user_id = auth.uid()
    )
  );

-- conversation_participants: insert own row (used by server actions with anon key)
create policy "cp_service_insert" on public.conversation_participants
  for insert with check (auth.uid() = user_id);

-- conversation_participants: update own last_read_at
create policy "cp_owner_update" on public.conversation_participants
  for update using (auth.uid() = user_id);

-- messages: select from conversations you're in
create policy "msg_participant_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

-- messages: insert only as yourself and only in conversations you're in
create policy "msg_participant_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

-- messages: soft-delete own messages only
create policy "msg_owner_update" on public.messages
  for update using (auth.uid() = sender_id);

-- ── Step 4: notifications insert policy ──────────────────────────────────────
-- notifications table exists from teacher-phase3-migration.sql
-- service role bypasses RLS, but this covers authenticated server actions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notif_service_insert'
  ) then
    execute $p$
      create policy "notif_service_insert" on public.notifications
        for insert with check (true)
    $p$;
  end if;
end;
$$;

-- ── Step 5: Trigger functions ─────────────────────────────────────────────────

create or replace function public.create_group_conversation()
returns trigger language plpgsql security definer as $$
begin
  insert into public.conversations (type, group_id)
  values ('group', NEW.id)
  on conflict do nothing;
  return NEW;
end;
$$;

drop trigger if exists trg_group_conversation on public.groups;
create trigger trg_group_conversation
  after insert on public.groups
  for each row execute function public.create_group_conversation();

-- ──

create or replace function public.add_member_to_group_conversation()
returns trigger language plpgsql security definer as $$
declare
  v_conv_id uuid;
begin
  select id into v_conv_id
  from public.conversations
  where group_id = NEW.group_id and type = 'group';

  if v_conv_id is not null then
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv_id, NEW.user_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_add_member_to_group_conv on public.group_members;
create trigger trg_add_member_to_group_conv
  after insert on public.group_members
  for each row execute function public.add_member_to_group_conversation();

-- ──

create or replace function public.add_teacher_to_group_conversation()
returns trigger language plpgsql security definer as $$
declare
  v_conv_id uuid;
begin
  if NEW.teacher_id is null then
    return NEW;
  end if;

  if OLD.teacher_id is distinct from NEW.teacher_id then
    select id into v_conv_id
    from public.conversations
    where group_id = NEW.id and type = 'group';

    if v_conv_id is not null then
      insert into public.conversation_participants (conversation_id, user_id)
      values (v_conv_id, NEW.teacher_id)
      on conflict do nothing;
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_add_teacher_to_group_conv on public.groups;
create trigger trg_add_teacher_to_group_conv
  after insert or update of teacher_id on public.groups
  for each row execute function public.add_teacher_to_group_conversation();

-- ── Step 6: Helper function ───────────────────────────────────────────────────

create or replace function public.users_share_group(user_a uuid, user_b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = user_a and b.user_id = user_b

    union all

    select 1 from public.groups g
    join public.group_members m on m.group_id = g.id
    where (g.teacher_id = user_a and m.user_id = user_b)
       or (g.teacher_id = user_b and m.user_id = user_a)
  );
$$;

-- ── Step 7: Enable Realtime ───────────────────────────────────────────────────

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_participants;

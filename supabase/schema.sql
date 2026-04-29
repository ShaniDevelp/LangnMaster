-- LangMaster Schema

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null check (role in ('student', 'teacher')),
  bio text,
  avatar_url text,
  languages text[], -- teacher: languages they teach; student: languages they're learning
  created_at timestamptz default now()
);

-- Courses
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  language text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  duration_weeks int not null,
  sessions_per_week int not null default 3,
  max_group_size int not null default 2,
  price_usd numeric(10,2) not null default 0,
  thumbnail_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enrollments
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'active', 'completed', 'cancelled')),
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- Groups (teacher + 2 students assigned for a course)
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  week_start date not null, -- Monday of the week sessions begin
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz default now()
);

-- Group members (students in a group)
create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  unique(group_id, user_id)
);

-- Sessions (scheduled class meetings)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  status text not null default 'scheduled' check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  room_token text unique default gen_random_uuid()::text,
  recording_url text,
  notes text,
  created_at timestamptz default now()
);

-- WebRTC signaling messages (ephemeral, for video call setup)
create table public.signaling (
  id uuid default gen_random_uuid() primary key,
  room_token text not null,
  from_user uuid references public.profiles(id) on delete cascade not null,
  to_user uuid references public.profiles(id) on delete cascade,
  type text not null, -- 'offer', 'answer', 'ice-candidate', 'join', 'leave'
  payload jsonb not null,
  created_at timestamptz default now()
);
create index on public.signaling(room_token, created_at);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.sessions enable row level security;
alter table public.signaling enable row level security;

-- Profiles: users can read all, only own write
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Courses: everyone can read active courses
create policy "courses_select" on public.courses for select using (is_active = true);

-- Enrollments: students see/manage own; teachers see their course enrollments
create policy "enrollments_select" on public.enrollments for select
  using (auth.uid() = user_id or auth.uid() in (
    select teacher_id from public.groups where course_id = enrollments.course_id
  ));
create policy "enrollments_insert" on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Groups: teacher and members can see
create policy "groups_select" on public.groups for select
  using (auth.uid() = teacher_id or auth.uid() in (
    select user_id from public.group_members where group_id = groups.id
  ));

-- Group members: same as groups
create policy "group_members_select" on public.group_members for select
  using (auth.uid() in (
    select teacher_id from public.groups where id = group_members.group_id
  ) or auth.uid() = user_id);

-- Sessions: group teacher and members
create policy "sessions_select" on public.sessions for select
  using (auth.uid() in (
    select teacher_id from public.groups where id = sessions.group_id
  ) or auth.uid() in (
    select user_id from public.group_members where group_id = sessions.group_id
  ));

-- Signaling: users in the room
create policy "signaling_select" on public.signaling for select
  using (auth.uid() = from_user or auth.uid() = to_user);
create policy "signaling_insert" on public.signaling for insert
  with check (auth.uid() = from_user);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sample courses seed
insert into public.courses (name, description, language, level, duration_weeks, sessions_per_week, price_usd) values
('English for Beginners', 'Build your English foundation with vocabulary, grammar, and conversational skills. Perfect for absolute beginners.', 'English', 'beginner', 12, 3, 149.00),
('Business English', 'Master professional English for meetings, emails, and presentations. Accelerate your career.', 'English', 'intermediate', 8, 3, 199.00),
('Advanced English Fluency', 'Achieve native-like fluency through intensive conversation practice and advanced grammar.', 'English', 'advanced', 16, 3, 249.00),
('Spanish Basics', 'Learn Spanish from scratch with live conversation practice. Fun and interactive sessions.', 'Spanish', 'beginner', 12, 3, 149.00),
('French Immersion', 'Immersive French learning with a focus on speaking and listening skills.', 'French', 'intermediate', 10, 2, 179.00);

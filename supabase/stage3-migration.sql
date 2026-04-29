-- Stage 3: Course detail tables

-- Outcomes on courses
alter table public.courses
  add column if not exists outcomes text[] default '{}';

-- Extended teacher profiles
create table if not exists public.teacher_profiles (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  intro_video_url text,
  years_experience int not null default 0,
  certifications  text[] default '{}',
  languages_taught text[] default '{}',
  rating          numeric(3,2) default 0,
  review_count    int default 0,
  created_at      timestamptz default now()
);

-- Course curriculum weeks
create table if not exists public.course_modules (
  id          uuid default gen_random_uuid() primary key,
  course_id   uuid references public.courses(id) on delete cascade not null,
  week_number int not null,
  title       text not null,
  topics      text[] default '{}',
  unique(course_id, week_number)
);

-- Pool of teachers who teach a course (shown pre-enrollment)
create table if not exists public.course_teachers (
  id         uuid default gen_random_uuid() primary key,
  course_id  uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  unique(course_id, teacher_id)
);

-- Student reviews for courses
create table if not exists public.reviews (
  id         uuid default gen_random_uuid() primary key,
  course_id  uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  rating     int not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);

-- RLS
alter table public.teacher_profiles enable row level security;
alter table public.course_modules    enable row level security;
alter table public.course_teachers   enable row level security;
alter table public.reviews           enable row level security;

create policy "teacher_profiles_select" on public.teacher_profiles for select using (true);
create policy "teacher_profiles_insert" on public.teacher_profiles for insert with check (auth.uid() = user_id);
create policy "teacher_profiles_update" on public.teacher_profiles for update using (auth.uid() = user_id);

create policy "course_modules_select"  on public.course_modules  for select using (true);
create policy "course_teachers_select" on public.course_teachers for select using (true);

create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = student_id);
create policy "reviews_update" on public.reviews for update using (auth.uid() = student_id);

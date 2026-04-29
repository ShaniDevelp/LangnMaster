-- Onboarding fields for student profiles
alter table public.profiles
  add column if not exists native_lang text,
  add column if not exists target_langs text[] default '{}',
  add column if not exists levels jsonb default '{}',
  add column if not exists timezone text,
  add column if not exists availability jsonb default '[]',
  add column if not exists goals text[] default '{}',
  add column if not exists onboarding_completed boolean default false;

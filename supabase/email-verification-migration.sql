-- Email verification + password reset OTP codes.
-- Self-managed so codes are delivered via Resend (not Supabase auth emails,
-- which are rate limited). One live row per (email, type) — resend overwrites it.

create table if not exists public.email_verification_codes (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  user_id      uuid,
  type         text not null check (type in ('signup', 'recovery')),
  code_hash    text not null,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  attempts     int not null default 0,
  last_sent_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- One active code per email+purpose. Resend/new request upserts on this key.
create unique index if not exists email_verification_codes_email_type_key
  on public.email_verification_codes (email, type);

-- Only the service role (which bypasses RLS) ever touches this table.
-- Enabling RLS with no policies blocks anon/authenticated clients entirely.
alter table public.email_verification_codes enable row level security;

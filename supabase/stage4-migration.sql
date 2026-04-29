-- Stage 4: Payment fields on enrollments

alter table public.enrollments
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  add column if not exists stripe_session_id text,
  add column if not exists refunded_at timestamptz;

-- Unique index so webhook upsert is safe
create unique index if not exists enrollments_stripe_session_id_idx
  on public.enrollments(stripe_session_id)
  where stripe_session_id is not null;

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Called by proxy when teacher has no x-teacher-approved / x-teacher-onboarded cookies.
// Reads application status + onboarding_completed from DB, sets cookies, redirects back.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/teacher/dashboard'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Read application status with the admin client (keyed by the verified
  // user.id). RLS-gated reads can return empty right after a login redirect
  // before the session fully propagates — which would wrongly read 'none' and
  // bounce the teacher back to the application form. Onboarding now lives inside
  // the application — approval is the only gate.
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app } = await (admin as any)
    .from('teacher_applications')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const appStatus = (app as { status: string } | null)?.status ?? 'none'
  const isApproved = appStatus === 'approved'
  const isPending = appStatus === 'pending' || appStatus === 'rejected'

  const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 7 }

  let redirectTo = next
  if (appStatus === 'none') redirectTo = '/teacher/application'
  else if (isPending) redirectTo = '/teacher/pending'

  const response = NextResponse.redirect(new URL(redirectTo, request.url))

  if (appStatus !== 'none') response.cookies.set('x-teacher-app-submitted', 'true', COOKIE_OPTS)
  if (isApproved) response.cookies.set('x-teacher-approved', 'true', COOKIE_OPTS)

  return response
}

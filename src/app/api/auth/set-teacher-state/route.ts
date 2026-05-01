import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called by proxy when teacher has no x-teacher-approved / x-teacher-onboarded cookies.
// Reads application status + onboarding_completed from DB, sets cookies, redirects back.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/teacher/dashboard'

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.redirect(new URL('/login', request.url))

  // Read onboarding_completed from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', session.user.id)
    .single()

  const onboardingCompleted =
    (profile as { onboarding_completed: boolean | null } | null)?.onboarding_completed ?? false

  // Read application status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app } = await (supabase as any)
    .from('teacher_applications')
    .select('status')
    .eq('user_id', session.user.id)
    .single()

  const appStatus = (app as { status: string } | null)?.status ?? 'none'
  const isApproved = appStatus === 'approved'

  const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 7 }

  let redirectTo = next
  if (!isApproved) redirectTo = '/teacher/pending'
  else if (!onboardingCompleted) redirectTo = '/teacher/onboarding'

  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  if (isApproved) response.cookies.set('x-teacher-approved', 'true', COOKIE_OPTS)
  if (onboardingCompleted) response.cookies.set('x-teacher-onboarded', 'true', COOKIE_OPTS)

  return response
}

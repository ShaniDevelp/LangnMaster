import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

const ROLE_COOKIE = 'x-user-role'
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 7 }

// OAuth (Google) redirect target. Exchanges the code for a session, provisions
// a profile for first-time users (defaulting to the student role), and routes
// by role. New users get the Resend welcome email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(oauthError)}`, origin))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
  }

  const supabase = await createClient()
  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeErr) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeErr.message)}`, origin))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=no_user', origin))
  }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    (user.email?.split('@')[0] ?? 'there')

  // The handle_new_user DB trigger ALWAYS creates a profile (role 'student' for
  // OAuth, since Google sends no role). So profile-existence can't tell us if
  // this is a first sign-in — use the auth user's age instead.
  const createdMs = user.created_at ? new Date(user.created_at).getTime() : 0
  const isNew = Date.now() - createdMs < 2 * 60 * 1000 // first sign-in window

  let role = (existing as { role: string } | null)?.role ?? 'student'

  if (isNew) {
    // Apply the chosen role. Primary signal is the redirectTo query (?role=);
    // cookie is a fallback in case the query is stripped. Overrides the
    // trigger's default so "Sign up as Teacher" via Google actually sticks.
    const cookieStore = await cookies()
    const chosen = searchParams.get('role') ?? cookieStore.get('x-oauth-role')?.value
    if (chosen === 'teacher' || chosen === 'student') role = chosen

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('profiles')
      .upsert({ id: user.id, name, role }, { onConflict: 'id' })

    const newRole = role as 'student' | 'teacher'
    after(async () => {
      const res = await sendWelcomeEmail({ to: user.email!, name, role: newRole })
      if (res.error) console.error('[email] welcome failed:', res.error)
    })
  }

  // Decide destination. New teachers start at their application; new students
  // at onboarding. Returning users go to their dashboard.
  let dest: string
  if (role === 'admin') dest = '/admin/dashboard'
  else if (role === 'teacher') dest = isNew ? '/teacher/application' : '/api/auth/set-teacher-state?next=/teacher/dashboard'
  else dest = isNew ? '/student/onboarding' : '/student/dashboard'

  const response = NextResponse.redirect(new URL(dest, origin))
  response.cookies.set(ROLE_COOKIE, role!, COOKIE_OPTS)
  response.cookies.delete('x-oauth-role')
  return response
}

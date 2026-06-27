'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { generateAndSendCode, verifyCode } from '@/lib/auth/otp'

const ROLE_COOKIE = 'x-user-role'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function getRoleFromDb(userId: string): Promise<string> {
  // Service role bypasses RLS — guarantees accurate role regardless of policy state
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('role').eq('id', userId).single()
  return (data as { role: string } | null)?.role ?? 'student'
}

function postLoginPath(role: string): string {
  if (role === 'admin') return '/admin/dashboard'
  // Teachers must go through the state machine so the proxy gets fresh cookies
  if (role === 'teacher') return '/api/auth/set-teacher-state?next=/teacher/dashboard'
  return '/student/dashboard'
}

// ── Sign up ──────────────────────────────────────────────────────────────────
// Creates the user UNCONFIRMED (no Supabase email — admin.createUser never
// sends one), then emails a 6-digit code via Resend. The account stays inert
// until the code is verified on /verify.

export async function signUp(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = (formData.get('role') as 'student' | 'teacher') ?? 'student'

  const admin = createAdminClient()

  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { name, role },
  })

  if (createErr) {
    // Email already exists. Allow unconfirmed accounts to re-register + resend;
    // block confirmed ones (they should sign in or reset password).
    if (/already.*registered|already been registered|email.*exists/i.test(createErr.message)) {
      // generateLink returns the existing user object (without sending anything)
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
      const existing = linkData?.user
      if (existing?.email_confirmed_at) {
        return { error: 'This email is already registered. Please sign in.' }
      }
      if (existing) {
        // Unconfirmed retry — refresh credentials so the new password sticks.
        await admin.auth.admin.updateUserById(existing.id, {
          password,
          user_metadata: { name, role },
        })
      }
    } else {
      return { error: createErr.message }
    }
  }

  const sent = await generateAndSendCode({ email, userId: null, type: 'signup' })
  if (!sent.ok) return { error: sent.error }

  redirect(`/verify?email=${encodeURIComponent(email)}&role=${role}`)
}

// ── Verify the signup code ─────────────────────────────────────────────────────
// On success: confirms the email + creates a session server-side (via a
// throwaway magiclink token — no password needed here), provisions the profile,
// and fires the Resend welcome email.

export async function verifyEmailCode(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const code = (formData.get('code') as string).trim()

  const result = await verifyCode({ email, type: 'signup', code })
  if (!result.ok) return { error: result.error }

  const admin = createAdminClient()
  const supabase = await createClient()

  // Mint a one-time token and consume it to establish a session. verifyOtp also
  // marks the email confirmed.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  const tokenHash = linkData?.properties?.hashed_token
  if (linkErr || !tokenHash) return { error: 'Could not complete verification. Try again.' }

  const { data: sess, error: otpErr } = await supabase.auth.verifyOtp({
    type: 'email',
    token_hash: tokenHash,
  })
  if (otpErr || !sess.user) return { error: otpErr?.message ?? 'Verification failed.' }

  const user = sess.user
  const role = (user.user_metadata?.role as 'student' | 'teacher') ?? 'student'
  const name = (user.user_metadata?.name as string) ?? ''

  // Make sure a profile row exists with the right role.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('profiles')
    .upsert({ id: user.id, name, role }, { onConflict: 'id' })

  // Welcome email via Resend — fire-and-forget, both roles.
  after(async () => {
    const ctaPath = role === 'teacher' ? '/teacher/application' : '/student/onboarding'
    const res = await sendWelcomeEmail({ to: email, name, role })
    if (res.error) console.error('[email] welcome failed:', res.error)
    void ctaPath
  })

  const cookieStore = await cookies()
  cookieStore.set(ROLE_COOKIE, role, COOKIE_OPTS)

  redirect(role === 'teacher' ? '/teacher/application' : '/student/onboarding')
}

// ── Resend the signup code ─────────────────────────────────────────────────────

export async function resendVerificationCode(email: string) {
  const sent = await generateAndSendCode({
    email: email.trim().toLowerCase(),
    userId: null,
    type: 'signup',
  })
  if (!sent.ok) return { error: sent.error, cooldownSeconds: sent.cooldownSeconds }
  return { ok: true }
}

// ── Sign in ────────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Unverified account — bounce to the code screen instead of a dead error.
    if (/not confirmed|not verified/i.test(error.message)) {
      await generateAndSendCode({ email, userId: null, type: 'signup' })
      redirect(`/verify?email=${encodeURIComponent(email)}`)
    }
    return { error: error.message }
  }

  const role = await getRoleFromDb(data.user.id)

  const cookieStore = await cookies()
  cookieStore.set(ROLE_COOKIE, role, COOKIE_OPTS)

  redirect(postLoginPath(role))
}

export async function signInAdmin(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const role = await getRoleFromDb(data.user.id)
  if (role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ROLE_COOKIE, 'admin', COOKIE_OPTS)

  redirect('/admin/dashboard')
}

// ── Password reset (6-digit code via Resend) ────────────────────────────────────

export async function requestPasswordReset(email: string) {
  const clean = email.trim().toLowerCase()
  const admin = createAdminClient()

  // Only send if the account exists. Always return ok to avoid leaking which
  // emails are registered.
  const { data: linkData } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: clean,
  })
  if (linkData?.user) {
    await generateAndSendCode({ email: clean, userId: linkData.user.id, type: 'recovery' })
  }
  return { ok: true }
}

export async function resetPassword(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const code = (formData.get('code') as string).trim()
  const password = formData.get('password') as string

  const result = await verifyCode({ email, type: 'recovery', code })
  if (!result.ok) return { error: result.error }

  const admin = createAdminClient()
  let userId = result.userId
  if (!userId) {
    const { data: linkData } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    userId = linkData?.user?.id ?? null
  }
  if (!userId) return { error: 'Account not found.' }

  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })
  if (updErr) return { error: updErr.message }

  return { ok: true }
}

// ── Google OAuth ────────────────────────────────────────────────────────────────

export async function signInWithGoogle(role?: 'student' | 'teacher') {
  const supabase = await createClient()

  // Stash the chosen role so the callback can apply it to a brand-new account.
  // Short-lived; ignored for users who already have a profile.
  if (role === 'student' || role === 'teacher') {
    const cookieStore = await cookies()
    cookieStore.set('x-oauth-role', role, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/api/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) return { error: error.message }
  if (data?.url) redirect(data.url)
  return { error: 'Could not start Google sign-in.' }
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  // Clear role + all teacher-state cookies so they never bleed into a new session
  cookieStore.delete(ROLE_COOKIE)
  cookieStore.delete('x-teacher-app-submitted')
  cookieStore.delete('x-teacher-approved')
  cookieStore.delete('x-teacher-onboarded')
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signOutAdmin() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  cookieStore.delete(ROLE_COOKIE)
  await supabase.auth.signOut()
  redirect('/admin/login')
}

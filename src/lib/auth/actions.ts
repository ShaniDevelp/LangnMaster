'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ROLE_COOKIE = 'x-user-role'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

async function getRoleFromDb(userId: string): Promise<string> {
  // Service role bypasses RLS — guarantees accurate role regardless of policy state
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('role').eq('id', userId).single()
  return (data as { role: string } | null)?.role ?? 'student'
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as 'student' | 'teacher'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })

  if (error) return { error: error.message }

  if (!data.session) {
    // Email confirmation required — no session yet, send to login
    redirect('/login')
  }

  const cookieStore = await cookies()
  cookieStore.set(ROLE_COOKIE, role, COOKIE_OPTS)

  redirect(role === 'teacher' ? '/teacher/application' : '/student/onboarding')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const role = await getRoleFromDb(data.user.id)

  const cookieStore = await cookies()
  cookieStore.set(ROLE_COOKIE, role, COOKIE_OPTS)

  if (role === 'admin') redirect('/admin/dashboard')
  // Teachers must go through the state machine so the proxy gets fresh cookies
  if (role === 'teacher') redirect('/api/auth/set-teacher-state?next=/teacher/dashboard')
  redirect('/student/dashboard')
}

export async function signInAdmin(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
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

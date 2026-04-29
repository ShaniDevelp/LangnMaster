'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import type { Course } from '@/lib/supabase/types'

// ── Enrollment (free / post-payment) ────────────────────────────────────────

export async function enrollInCourse(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const courseId = formData.get('courseId') as string

  await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId, status: 'pending' })

  redirect('/student/dashboard')
}

// ── Stripe Checkout ──────────────────────────────────────────────────────────

export async function createCheckoutSession(courseId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courseRaw } = await supabase
    .from('courses').select('*').eq('id', courseId).single()
  if (!courseRaw) redirect('/student/courses')

  const course = courseRaw as Course
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Free course — skip Stripe, enroll directly
  if (Number(course.price_usd) === 0) {
    await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      status: 'pending',
      payment_status: 'paid',
    } as Parameters<typeof supabase.from>[0] extends never ? never : object)
    redirect('/student/dashboard?enrolled=1')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.name,
            description: `${course.duration_weeks}-week live course · ${course.sessions_per_week} sessions/week · group of ${course.max_group_size}`,
          },
          unit_amount: Math.round(Number(course.price_usd) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { user_id: user.id, course_id: courseId },
    success_url: `${appUrl}/student/courses/${courseId}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/student/courses/${courseId}`,
    allow_promotion_codes: true,
  })

  redirect(session.url!)
}

// ── Onboarding ───────────────────────────────────────────────────────────────

type OnboardingData = {
  nativeLang: string
  targetLangs: string[]
  levels: Record<string, string>
  timezone: string
  availability: string[]
  goals: string[]
}

export async function saveOnboarding(data: OnboardingData): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({
      native_lang: data.nativeLang,
      target_langs: data.targetLangs,
      levels: data.levels as unknown as Record<string, string>,
      timezone: data.timezone,
      availability: data.availability as unknown as string[],
      goals: data.goals,
      onboarding_completed: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', user.id)

  if (error) return { error: error.message }

  const cookieStore = await cookies()
  cookieStore.set('x-onboarding-done', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/student/dashboard')
}

// ── Profile update ───────────────────────────────────────────────────────────

type ProfileUpdateData = {
  name: string
  bio: string
  nativeLang: string
  targetLangs: string[]
  levels: Record<string, string>
  timezone: string
  availability: string[]
  goals: string[]
}

export async function updateProfile(data: ProfileUpdateData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      bio: data.bio || null,
      native_lang: data.nativeLang,
      target_langs: data.targetLangs,
      levels: data.levels as unknown as Record<string, string>,
      timezone: data.timezone,
      availability: data.availability as unknown as string[],
      goals: data.goals,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', user.id)

  if (error) return { error: error.message }
  return {}
}

// ── Session rating ──────────────────────────────────────────────────────────

export async function rateSession(
  courseId: string,
  teacherId: string | null,
  rating: number,
  body: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase.from('reviews').insert({
    course_id: courseId,
    student_id: user.id,
    teacher_id: teacherId ?? null,
    rating,
    body,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  if (error) return { error: error.message }
  return {}
}

// ── Webhook fulfillment (called from route handler, not client) ───────────────

export async function fulfillCheckoutSession(stripeSessionId: string): Promise<void> {
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
  if (session.payment_status !== 'paid') return

  const { user_id, course_id } = session.metadata ?? {}
  if (!user_id || !course_id) return

  const supabase = createAdminClient()

  await supabase.from('enrollments').upsert(
    {
      user_id,
      course_id,
      status: 'pending',
      payment_status: 'paid',
      stripe_session_id: stripeSessionId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { onConflict: 'user_id,course_id' }
  )
}

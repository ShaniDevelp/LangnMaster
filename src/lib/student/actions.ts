'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// createAdminClient used by the disabled Stripe fulfillment below.
// Stripe disabled — manual Easypaisa/JazzCash flow for now, verified by admin.
// Re-enable when integrating a real gateway. See src/lib/payments/manual.ts.
// import { stripe } from '@/lib/stripe'
import { sendEnrolledEmail, sendAdminEnrollmentEmail } from '@/lib/email'
// import type { Course } from '@/lib/supabase/types' // used by disabled Stripe checkout

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

// Enroll without payment — student pays after group is assigned
export async function enrollWithoutPayment(courseId: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) redirect('/student/dashboard')

  const { error } = await supabase.from('enrollments').insert({
    user_id: user.id,
    course_id: courseId,
    status: 'pending',
    payment_status: 'unpaid',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  if (error) return { error: error.message }

  // Fire-and-forget enrollment email — never blocks enroll or breaks on failure.
  after(async () => {
    const { data: course } = await supabase
      .from('courses').select('name, level').eq('id', courseId).single()
    const { data: profile } = await supabase
      .from('profiles').select('name').eq('id', user.id).single()

    const to = user.email
    const c = course as { name: string; level: string } | null
    const courseTitle = c?.name
    if (!courseTitle) return
    const studentName = (profile as { name: string } | null)?.name ?? ''

    // Student confirmation
    if (to) {
      const res = await sendEnrolledEmail({ to, name: studentName, courseTitle })
      if (res.error) console.error('[email] enrolled failed:', res.error)
    }

    // Admin notification
    const adminRes = await sendAdminEnrollmentEmail({
      studentName,
      studentEmail: to ?? '—',
      courseTitle,
      courseLevel: c?.level ?? '—',
    })
    if (adminRes.error) console.error('[email] admin enrollment failed:', adminRes.error)
  })

  redirect('/student/dashboard?enrolled=1')
}

// ── Stripe Checkout (DISABLED) ────────────────────────────────────────────────
// Payments are handled manually for now: students pay via Easypaisa/JazzCash and
// an admin verifies the payment (setEnrollmentPaymentStatus in admin/actions.ts),
// which flips payment_status to 'paid' — the same effect this used to have.
// Kept commented for when a real gateway is integrated.
/*
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
  if (Number(course.price_pkr) === 0) {
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
          currency: 'pkr',
          product_data: {
            name: course.name,
            description: `${course.duration_weeks}-week live course · ${course.sessions_per_week} sessions/week · group of ${course.max_group_size}`,
          },
          unit_amount: Math.round(Number(course.price_pkr) * 100),
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
*/

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

// ── Webhook fulfillment (DISABLED — Stripe) ───────────────────────────────────
// Replaced by manual admin verification (setEnrollmentPaymentStatus). Kept for
// when a real gateway is wired back up.
/*
export async function fulfillCheckoutSession(stripeSessionId: string): Promise<void> {
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
  if (session.payment_status !== 'paid') return

  const { user_id, course_id } = session.metadata ?? {}
  if (!user_id || !course_id) return

  const supabase = createAdminClient()

  // Check if enrollment already exists (student enrolled without payment first)
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', user_id)
    .eq('course_id', course_id)
    .maybeSingle()

  if (existing) {
    // Only update payment fields — preserve current status (could be 'assigned' or 'active')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('enrollments').update({
      payment_status: 'paid',
      stripe_session_id: stripeSessionId,
    } as any).eq('id', existing.id)
  } else {
    // New enrollment (paid upfront)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('enrollments').insert({
      user_id,
      course_id,
      status: 'pending',
      payment_status: 'paid',
      stripe_session_id: stripeSessionId,
    } as any)
  }
}
*/

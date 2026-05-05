'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// ── Teacher Application ───────────────────────────────────────────────────────

type ApplicationData = {
  languagesTaught: { lang: string; proficiency: string }[]
  certifications: string[]
  introVideoUrl: string
  teachingBio: string
  availability: string[]
  timezone: string
  rateExpectation: string
}

export async function submitApplication(
  data: ApplicationData
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Upsert so teacher can re-submit if rejected
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('teacher_applications')
    .upsert(
      {
        user_id: user.id,
        languages_taught: data.languagesTaught,
        certifications: data.certifications,
        intro_video_url: data.introVideoUrl || null,
        teaching_bio: data.teachingBio || null,
        availability: data.availability,
        timezone: data.timezone || null,
        rate_expectation: data.rateExpectation
          ? parseFloat(data.rateExpectation)
          : null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        admin_notes: null,
      },
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message }

  const cookieStore = await cookies()
  cookieStore.set('x-teacher-app-submitted', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/teacher/pending')
}

// ── Teacher Onboarding (post-approval wizard) ─────────────────────────────────

type TeacherOnboardingData = {
  timezone: string
  availability: string[]
  preferences: {
    preferredLevels: string[]
    preferredDuration: string
  }
}

export async function saveTeacherOnboarding(
  data: TeacherOnboardingData
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the rich data from teacher_applications to carry into profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: appData } = await (supabase as any)
    .from('teacher_applications')
    .select('languages_taught, certifications, teaching_bio, rate_expectation, intro_video_url')
    .eq('user_id', user.id)
    .maybeSingle()

  // Update profile with timezone, availability, and all teacher-specific data
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      timezone: data.timezone,
      availability: data.availability as unknown as string[],
      onboarding_completed: true,
      preferences: data.preferences,
      languages_taught: appData?.languages_taught ?? [],
      certifications: appData?.certifications ?? [],
      intro_video_url: appData?.intro_video_url ?? null,
      bio: appData?.teaching_bio ?? null,
      rate_per_session: appData?.rate_expectation ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', user.id)

  if (profileErr) return { error: profileErr.message }

  // Set cookie so proxy knows onboarding is done without DB hit
  const cookieStore = await cookies()
  cookieStore.set('x-teacher-onboarded', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/teacher/dashboard')
}

// ── Admin: Approve / Reject Teacher ──────────────────────────────────────────
// Called from the API route (admin only — uses service role)

export async function approveTeacher(
  teacherId: string,
  approved: boolean,
  adminNotes?: string
): Promise<{ error?: string }> {
  const admin = createAdminClient()

  // Update application status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: appErr } = await (admin as any)
    .from('teacher_applications')
    .update({
      status: approved ? 'approved' : 'rejected',
      admin_notes: adminNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('user_id', teacherId)

  if (appErr) return { error: appErr.message }

  if (approved) {
    // Mark onboarding_completed so teacher can pass proxy guard
    // They still need to go through onboarding wizard on first login
    const { error: profileErr } = await admin
      .from('profiles')
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', teacherId)

    // We don't set onboarding_completed here — teacher must complete the wizard first.
    // We just need the approved flag to let them through /teacher/application and /teacher/onboarding.
    void profileErr // not blocking
  }

  return {}
}

export async function requestToTeachCourse(courseId: string): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('course_teachers')
    .insert({
      course_id: courseId,
      teacher_id: user.id,
      status: 'pending'
    })

  if (error) {
    if (error.code === '23505') return { error: 'Request already exists' }
    return { error: error.message }
  }
}

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

  // Update profile: timezone + availability
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      timezone: data.timezone,
      availability: data.availability as unknown as string[],
      onboarding_completed: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', user.id)

  if (profileErr) return { error: profileErr.message }

  // Upsert teacher_profile preferences
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: tpErr } = await (supabase as any)
    .from('teacher_profiles')
    .upsert(
      {
        user_id: user.id,
        preferences: data.preferences,
      },
      { onConflict: 'user_id' }
    )

  if (tpErr) return { error: tpErr.message }

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

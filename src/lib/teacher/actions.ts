'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendGroupPublishedEmails, sendAdminGroupResponse } from '@/lib/email/group-notify'
import {
  notifyAdminTeacherApplication,
  notifyAdminCourseRequest,
} from '@/lib/email/teacher-notify'

// ── Teacher Application ───────────────────────────────────────────────────────

type ApplicationData = {
  languagesTaught: { lang: string; proficiency: string }[]
  certifications: string[]
  introVideoUrl: string
  teachingBio: string
  availability: string[]
  timezone: string
  rateExpectation?: string
  yearsExperience?: string
  preferredLevels: string[]
  preferredDuration: string
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
        rate_expectation: data.rateExpectation ? Number(data.rateExpectation) : null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        admin_notes: null,
      },
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message }

  // Teaching preferences (levels + session duration) used to live in a second
  // post-approval onboarding wizard. That flow is gone — the application now
  // collects them, so persist them on the profile up front. They survive
  // approval (approveTeacher carries the rest of the application across).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('profiles')
    .update({
      preferences: {
        preferredLevels: data.preferredLevels,
        preferredDuration: data.preferredDuration,
      },
      years_experience: data.yearsExperience ? Number(data.yearsExperience) : null,
    })
    .eq('id', user.id)

  // Notify admin of the new application. Fire-and-forget.
  after(() =>
    notifyAdminTeacherApplication({
      teacherId: user.id,
      teacherEmail: user.email ?? '—',
      languages: data.languagesTaught.map(l => l.lang),
    }),
  )

  const cookieStore = await cookies()
  cookieStore.set('x-teacher-app-submitted', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/teacher/pending')
}

// Admin approve/reject lives in the API route at
// /api/admin/approve-teacher (admin-only, service role) — it owns the status
// update, profile carry-over, and the result email. Do not re-add a server
// action here; a duplicate path is what previously dropped the email.

// ── Teacher: respond to a group proposal ─────────────────────────────────────

export async function acceptGroupProposal(groupId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Verify caller is the proposed teacher and group is in pending_teacher state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group } = await (admin as any)
    .from('groups')
    .select('id, teacher_id, course_id, acceptance_status')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Group not found' }
  if (group.teacher_id !== user.id) return { error: 'Not authorized' }
  if (group.acceptance_status !== 'pending_teacher') return { error: 'Group is not pending acceptance' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin as any)
    .from('groups')
    .update({ acceptance_status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', groupId)

  if (updateErr) return { error: updateErr.message }

  // Flip enrollments for all members of this group to 'assigned'
  const { data: members } = await admin
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)

  if (memberIds.length > 0) {
    await admin
      .from('enrollments')
      .update({ status: 'assigned' })
      .eq('course_id', group.course_id)
      .in('user_id', memberIds)
      .eq('status', 'pending')

    for (const userId of memberIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('notifications').insert({
        user_id: userId,
        type: 'group_assigned',
        payload: { group_id: groupId },
      })
    }

    // Group is now live — email teacher + students. Fire-and-forget.
    after(() =>
      sendGroupPublishedEmails({
        courseId: group.course_id,
        teacherId: group.teacher_id,
        studentIds: memberIds,
      }),
    )
  }

  // Notify admin of the acceptance so they know nothing more is needed.
  after(() =>
    sendAdminGroupResponse({
      courseId: group.course_id,
      teacherId: group.teacher_id,
      status: 'accepted',
    }),
  )

  return {}
}

export async function declineGroupProposal(groupId: string, reason?: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group } = await (admin as any)
    .from('groups')
    .select('id, teacher_id, course_id, acceptance_status, declined_teachers, courses(name)')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Group not found' }
  if (group.teacher_id !== user.id) return { error: 'Not authorized' }
  if (group.acceptance_status !== 'pending_teacher') return { error: 'Group is not pending acceptance' }

  const { data: teacherProfile } = await admin
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const teacherName = (teacherProfile as { name: string } | null)?.name ?? 'Teacher'

  // Append this teacher's decline to the group's declined_teachers array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingDeclined: any[] = Array.isArray(group.declined_teachers) ? group.declined_teachers : []
  const updatedDeclined = [
    ...existingDeclined,
    {
      teacher_id: user.id,
      teacher_name: teacherName,
      reason: reason ?? null,
      declined_at: new Date().toISOString(),
    },
  ]

  // Mark group as declined — do NOT delete it; admin will reassign a new teacher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('groups').update({
    acceptance_status: 'declined',
    responded_at: new Date().toISOString(),
    declined_teachers: updatedDeclined,
  }).eq('id', groupId)

  // Notify admins so they can reassign
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseName = (group.courses as any)?.name ?? 'Unknown Course'
  const { data: admins } = await admin.from('profiles').select('id').eq('role', 'admin')
  for (const a of (admins ?? []) as { id: string }[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('notifications').insert({
      user_id: a.id,
      type: 'group_proposal_declined',
      payload: {
        group_id: groupId,
        teacher_id: user.id,
        teacher_name: teacherName,
        course_id: group.course_id,
        course_name: courseName,
        reason: reason ?? null,
      },
    })
  }

  // Email admin so they can reassign — reuse names already fetched above.
  after(() =>
    sendAdminGroupResponse({
      courseId: group.course_id,
      teacherId: user.id,
      status: 'declined',
      reason: reason ?? null,
      teacherName,
      courseTitle: courseName,
    }),
  )

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

  // Notify admin of the course teaching request. Fire-and-forget.
  after(() =>
    notifyAdminCourseRequest({
      teacherId: user.id,
      teacherEmail: user.email ?? '—',
      courseId,
    }),
  )
}

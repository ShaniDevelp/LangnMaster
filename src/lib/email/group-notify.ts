import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendGroupStudentEmail,
  sendGroupTeacherEmail,
  sendGroupProposalTeacherEmail,
  sendAdminGroupResponseEmail,
  sendPaymentConfirmedStudentEmail,
  sendPaymentConfirmedTeacherEmail,
} from '@/lib/email'

type Person = { id: string; name: string; email: string | null }

/**
 * Notifies admin that a teacher accepted/declined a group proposal, so admin
 * knows the next action. Fire-and-forget — never throws. Optional pre-fetched
 * teacherName/courseTitle skip the lookups when the caller already has them.
 */
export async function sendAdminGroupResponse(args: {
  courseId: string
  teacherId: string
  status: 'accepted' | 'declined'
  reason?: string | null
  teacherName?: string
  courseTitle?: string
}): Promise<void> {
  try {
    const admin = createAdminClient()

    let courseTitle = args.courseTitle
    if (!courseTitle) {
      const { data: course } = await admin
        .from('courses').select('name').eq('id', args.courseId).single()
      courseTitle = (course as { name: string } | null)?.name
    }
    if (!courseTitle) return

    let teacherName = args.teacherName
    if (!teacherName) {
      const { data: profile } = await admin
        .from('profiles').select('name').eq('id', args.teacherId).single()
      teacherName = (profile as { name: string } | null)?.name ?? 'A teacher'
    }

    const res = await sendAdminGroupResponseEmail({
      teacherName,
      courseTitle,
      status: args.status,
      reason: args.reason,
    })
    if (res.error) console.error('[email] admin group response failed:', res.error)
  } catch (err) {
    console.error('[email] admin group response batch failed:', err)
  }
}

/**
 * Sends the "respond to this group request" email to a teacher when a group is
 * proposed with an acceptance gate. Fire-and-forget — never throws.
 */
export async function sendGroupProposalEmail(args: {
  courseId: string
  teacherId: string
  studentCount: number
}): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: course } = await admin
      .from('courses').select('name').eq('id', args.courseId).single()
    const courseTitle = (course as { name: string } | null)?.name
    if (!courseTitle) return

    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', args.teacherId).single()
    const { data: auth } = await admin.auth.admin.getUserById(args.teacherId)
    const to = auth.user?.email
    if (!to) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://langmaster.app'
    const res = await sendGroupProposalTeacherEmail({
      to,
      props: {
        teacherName: (profile as { name: string } | null)?.name ?? '',
        courseTitle,
        studentCount: args.studentCount,
        respondUrl: `${appUrl}/teacher/proposals`,
      },
    })
    if (res.error) console.error('[email] group proposal failed:', res.error)
  } catch (err) {
    console.error('[email] group proposal batch failed:', err)
  }
}

/**
 * Sends group-published emails to the teacher and every student in a group.
 * Used by both the direct-publish path and the teacher-accepts-proposal path.
 * Fully self-contained and fire-and-forget — never throws.
 */
export async function sendGroupPublishedEmails(args: {
  courseId: string
  teacherId: string
  studentIds: string[]
}): Promise<void> {
  try {
    const admin = createAdminClient()

    // Course title
    const { data: course } = await admin
      .from('courses').select('name').eq('id', args.courseId).single()
    const courseTitle = (course as { name: string } | null)?.name
    if (!courseTitle) return

    // Names from profiles (single batched query)
    const allIds = [args.teacherId, ...args.studentIds]
    const { data: profiles } = await admin
      .from('profiles').select('id, name').in('id', allIds)
    const nameById = new Map(
      ((profiles as { id: string; name: string }[] | null) ?? []).map(p => [p.id, p.name]),
    )

    // Emails live in auth.users — fetch per id via service role
    const emailById = new Map<string, string | null>()
    await Promise.all(
      allIds.map(async id => {
        const { data } = await admin.auth.admin.getUserById(id)
        emailById.set(id, data.user?.email ?? null)
      }),
    )

    const toPerson = (id: string): Person => ({
      id,
      name: nameById.get(id) ?? '',
      email: emailById.get(id) ?? null,
    })

    const teacher = toPerson(args.teacherId)
    const students = args.studentIds.map(toPerson)

    // Teacher email
    if (teacher.email) {
      const res = await sendGroupTeacherEmail({
        to: teacher.email,
        props: {
          teacherName: teacher.name,
          courseTitle,
          studentNames: students.map(s => s.name || 'A student'),
        },
      })
      if (res.error) console.error('[email] group teacher failed:', res.error)
    }

    // Per-student email — each sees teacher + the OTHER students
    for (const s of students) {
      if (!s.email) continue
      const classmateNames = students
        .filter(o => o.id !== s.id)
        .map(o => o.name || 'A classmate')
      const res = await sendGroupStudentEmail({
        to: s.email,
        props: {
          studentName: s.name,
          courseTitle,
          teacherName: teacher.name || 'Your teacher',
          classmateNames,
        },
      })
      if (res.error) console.error('[email] group student failed:', res.error)
    }
  } catch (err) {
    console.error('[email] group published batch failed:', err)
  }
}

/** Format a UTC ISO timestamp into a readable label in the given timezone. */
function formatSessionLabel(iso: string, tz: string | null): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }
  try {
    return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz || 'UTC' }).format(new Date(iso))
  } catch {
    return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(new Date(iso))
  }
}

/**
 * Sent when an admin verifies a student's manual payment. Emails BOTH the student
 * (sessions unlocked + next session) and their teacher (student now active + next
 * session), each with content tailored to their role. Fire-and-forget — never throws.
 */
export async function sendPaymentVerifiedEmails(enrollmentId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://langmaster.app'

    // 1. Enrollment → student + course
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('user_id, course_id')
      .eq('id', enrollmentId)
      .single()
    const e = enrollment as { user_id: string; course_id: string } | null
    if (!e) return

    const { data: course } = await admin
      .from('courses').select('name').eq('id', e.course_id).single()
    const courseTitle = (course as { name: string } | null)?.name
    if (!courseTitle) return

    // 2. The student's group for this course (→ teacher + group_id for sessions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (admin as any)
      .from('group_members')
      .select('group_id, groups!inner(id, teacher_id, course_id)')
      .eq('user_id', e.user_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = ((memberships ?? []) as any[]).find(m => m.groups?.course_id === e.course_id)
    const groupId: string | null = membership?.groups?.id ?? null
    const teacherId: string | null = membership?.groups?.teacher_id ?? null

    // 3. Next upcoming session for that group (if scheduled)
    let nextSessionIso: string | null = null
    if (groupId) {
      const { data: sessionRows } = await admin
        .from('sessions')
        .select('scheduled_at')
        .eq('group_id', groupId)
        .in('status', ['scheduled', 'active'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
      nextSessionIso = (sessionRows as { scheduled_at: string }[] | null)?.[0]?.scheduled_at ?? null
    }

    // 4. Profiles (name + timezone) for student and teacher
    const ids = [e.user_id, ...(teacherId ? [teacherId] : [])]
    const { data: profiles } = await admin
      .from('profiles').select('id, name, timezone').in('id', ids)
    const profileById = new Map(
      ((profiles as { id: string; name: string; timezone: string | null }[] | null) ?? [])
        .map(p => [p.id, p]),
    )

    // Emails live in auth.users
    const emailById = new Map<string, string | null>()
    await Promise.all(ids.map(async id => {
      const { data } = await admin.auth.admin.getUserById(id)
      emailById.set(id, data.user?.email ?? null)
    }))

    const student = profileById.get(e.user_id)
    const teacher = teacherId ? profileById.get(teacherId) : null
    const studentName = student?.name ?? 'A student'
    const teacherName = teacher?.name ?? 'Your teacher'

    // 5. Student email — sessions unlocked + their next session (in their TZ)
    const studentEmail = emailById.get(e.user_id)
    if (studentEmail) {
      const res = await sendPaymentConfirmedStudentEmail({
        to: studentEmail,
        props: {
          studentName,
          courseTitle,
          teacherName,
          nextSessionLabel: nextSessionIso ? formatSessionLabel(nextSessionIso, student?.timezone ?? null) : null,
          dashboardUrl: `${appUrl}/student/dashboard`,
        },
      })
      if (res.error) console.error('[email] payment confirmed student failed:', res.error)
    }

    // 6. Teacher email — student now active + next session (in teacher's TZ)
    const teacherEmail = teacherId ? emailById.get(teacherId) : null
    if (teacherEmail) {
      const res = await sendPaymentConfirmedTeacherEmail({
        to: teacherEmail,
        props: {
          teacherName,
          studentName,
          courseTitle,
          nextSessionLabel: nextSessionIso ? formatSessionLabel(nextSessionIso, teacher?.timezone ?? null) : null,
          dashboardUrl: `${appUrl}/teacher/dashboard`,
        },
      })
      if (res.error) console.error('[email] payment confirmed teacher failed:', res.error)
    }
  } catch (err) {
    console.error('[email] payment verified batch failed:', err)
  }
}

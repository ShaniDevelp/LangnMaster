import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendAdminTeacherApplicationEmail,
  sendTeacherApplicationResultEmail,
  sendAdminCourseRequestEmail,
  sendTeacherCourseRequestResultEmail,
} from '@/lib/email'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://langmaster.app'

/**
 * Notifies admin that a teacher submitted an application. Fire-and-forget.
 */
export async function notifyAdminTeacherApplication(args: {
  teacherId: string
  teacherEmail: string
  languages: string[]
}): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', args.teacherId).single()

    const res = await sendAdminTeacherApplicationEmail({
      teacherName: (profile as { name: string } | null)?.name ?? '',
      teacherEmail: args.teacherEmail,
      languages: args.languages,
      reviewUrl: `${appUrl}/admin/teachers`,
    })
    if (res.error) console.error('[email] admin teacher application failed:', res.error)
  } catch (err) {
    console.error('[email] admin teacher application batch failed:', err)
  }
}

/**
 * Sends the approve/reject result email to a teacher. Fire-and-forget.
 */
export async function notifyTeacherApplicationResult(args: {
  teacherId: string
  approved: boolean
  adminNotes?: string | null
}): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', args.teacherId).single()
    const { data: auth } = await admin.auth.admin.getUserById(args.teacherId)
    const to = auth.user?.email
    if (!to) return

    const ctaUrl = args.approved
      ? `${appUrl}/teacher/dashboard`
      : `${appUrl}/teacher/application`

    const res = await sendTeacherApplicationResultEmail({
      to,
      props: {
        teacherName: (profile as { name: string } | null)?.name ?? '',
        approved: args.approved,
        adminNotes: args.adminNotes ?? null,
        ctaUrl,
      },
    })
    if (res.error) console.error('[email] teacher application result failed:', res.error)
  } catch (err) {
    console.error('[email] teacher application result batch failed:', err)
  }
}

/**
 * Notifies admin that a teacher requested to teach a course. Fire-and-forget.
 */
export async function notifyAdminCourseRequest(args: {
  teacherId: string
  teacherEmail: string
  courseId: string
}): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', args.teacherId).single()
    const { data: course } = await admin
      .from('courses').select('name').eq('id', args.courseId).single()
    const courseTitle = (course as { name: string } | null)?.name
    if (!courseTitle) return

    const res = await sendAdminCourseRequestEmail({
      teacherName: (profile as { name: string } | null)?.name ?? '',
      teacherEmail: args.teacherEmail,
      courseTitle,
      reviewUrl: `${appUrl}/admin/requests`,
    })
    if (res.error) console.error('[email] admin course request failed:', res.error)
  } catch (err) {
    console.error('[email] admin course request batch failed:', err)
  }
}

/**
 * Sends the approve/reject result to a teacher for a course-teaching request.
 * Looks up the request row to resolve teacher + course. Fire-and-forget.
 */
export async function notifyTeacherCourseRequestResult(args: {
  requestId: string
  approved: boolean
}): Promise<void> {
  try {
    const admin = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (admin as any)
      .from('course_teachers')
      .select('teacher_id, course_id')
      .eq('id', args.requestId)
      .single()
    if (!row) return

    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', row.teacher_id).single()
    const { data: course } = await admin
      .from('courses').select('name').eq('id', row.course_id).single()
    const { data: auth } = await admin.auth.admin.getUserById(row.teacher_id)

    const to = auth.user?.email
    const courseTitle = (course as { name: string } | null)?.name
    if (!to || !courseTitle) return

    const res = await sendTeacherCourseRequestResultEmail({
      to,
      props: {
        teacherName: (profile as { name: string } | null)?.name ?? '',
        courseTitle,
        approved: args.approved,
        ctaUrl: args.approved
          ? `${appUrl}/teacher/courses/${row.course_id}`
          : `${appUrl}/teacher/courses`,
      },
    })
    if (res.error) console.error('[email] teacher course request result failed:', res.error)
  } catch (err) {
    console.error('[email] teacher course request result batch failed:', err)
  }
}

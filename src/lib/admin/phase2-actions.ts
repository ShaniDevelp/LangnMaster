'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ManualGroupParams = {
  enrollmentIds: string[]
  courseId: string
  teacherId: string
  slots: string[] // e.g. ["Mon-10:00", "Wed-10:00"]
  requireAcceptance?: boolean // when true, group is created in 'pending_teacher' state and goes live only after teacher accepts
}

export async function assignManualGroup(params: ManualGroupParams): Promise<{ error?: string }> {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // 2. Fetch course duration
  const { data: course } = await supabase
    .from('courses')
    .select('duration_weeks')
    .eq('id', params.courseId)
    .single()

  if (!course) return { error: 'Course not found' }

  // 2a. Approval gate: teacher must have an approved course_teachers row for this course
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: approval } = await (supabase as any)
    .from('course_teachers')
    .select('id')
    .eq('teacher_id', params.teacherId)
    .eq('course_id', params.courseId)
    .eq('status', 'approved')
    .maybeSingle()

  if (!approval) return { error: 'Teacher is not approved to teach this course' }

  // 3. Fetch enrollments to get user_ids
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, user_id')
    .in('id', params.enrollmentIds)

  if (!enrollments || enrollments.length === 0) return { error: 'No enrollments found' }

  const weekStart = getNextMonday()
  const requireAcceptance = params.requireAcceptance ?? false

  // 4. Create Group
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupInsert: any = {
    course_id: params.courseId,
    teacher_id: params.teacherId,
    week_start: weekStart,
  }
  if (requireAcceptance) {
    groupInsert.acceptance_status = 'pending_teacher'
    groupInsert.proposed_at = new Date().toISOString()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group, error: groupErr } = await (supabase as any)
    .from('groups')
    .insert(groupInsert)
    .select('id')
    .single()

  if (groupErr || !group) return { error: groupErr?.message ?? 'Failed to create group' }

  // 5. Add members (so teacher can preview the roster on their proposal page)
  const { error: membersErr } = await supabase
    .from('group_members')
    .insert(enrollments.map(e => ({ group_id: group.id, user_id: e.user_id })))

  if (membersErr) return { error: membersErr.message }

  // 6. Generate precise sessions based on exact timeslots (preview-able by teacher even when pending)
  const sessions = generatePreciseSessions(group.id, weekStart, params.slots, course.duration_weeks)
  const { error: sessErr } = await supabase.from('sessions').insert(sessions)
  if (sessErr) return { error: sessErr.message }

  // 7. Update enrollment status — only flip to 'assigned' once teacher has accepted (or if no acceptance gate)
  if (!requireAcceptance) {
    const { error: enrollErr } = await supabase
      .from('enrollments')
      .update({ status: 'assigned' })
      .in('id', params.enrollmentIds)

    if (enrollErr) return { error: enrollErr.message }
  }

  // 8. Notifications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('notifications').insert({
    user_id: params.teacherId,
    type: requireAcceptance ? 'group_proposed' : 'new_group_assigned',
    payload: { group_id: group.id, students: enrollments.length }
  })

  // Only notify students if the group is live (no acceptance gate)
  if (!requireAcceptance) {
    for (const e of enrollments) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('notifications').insert({
        user_id: e.user_id,
        type: 'group_assigned',
        payload: { group_id: group.id }
      })
    }
  }

  revalidatePath('/admin/enrollments')
  revalidatePath('/admin/groups')
  revalidatePath('/admin/dashboard')
  revalidatePath('/teacher/proposals')

  return {}
}

function getNextMonday(): string {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const DAY_MAP: Record<string, number> = {
  'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
}

function generatePreciseSessions(groupId: string, weekStart: string, slots: string[], durationWeeks: number) {
  const sessions = []
  // weekStart is "YYYY-MM-DD", which parses as midnight UTC
  const start = new Date(weekStart) 

  for (let week = 0; week < durationWeeks; week++) {
    for (const slot of slots) {
      // slot format: "Mon-09:00" (These are UTC hours)
      const [dayStr, timeStr] = slot.split('-')
      const dayOffset = DAY_MAP[dayStr] ?? 0
      const [hours, minutes] = timeStr.split(':').map(Number)

      const d = new Date(start)
      d.setUTCDate(d.getUTCDate() + week * 7 + dayOffset)
      d.setUTCHours(hours, minutes, 0, 0)
      
      sessions.push({
        group_id: groupId,
        scheduled_at: d.toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
      })
    }
  }

  return sessions
}

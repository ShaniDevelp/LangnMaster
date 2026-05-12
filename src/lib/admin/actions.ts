'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Smart group assignment suggestions ────────────────────────────────────────
// Replaces the old round-robin assignGroups() which ignored both course_teachers
// approval and availability. This action computes proposals (no DB writes).
// Admin reviews and approves each via assignManualGroup in phase2-actions.

export type ProposedGroup = {
  id: string
  courseId: string
  courseName: string
  courseLanguage: string
  courseLevel: string
  sessionsPerWeek: number
  durationWeeks: number
  maxGroupSize: number
  enrollments: Array<{
    enrollmentId: string
    userId: string
    name: string
    avatarUrl: string | null
  }>
  proposedTeacher: {
    id: string
    name: string
    avatarUrl: string | null
    overlap: number
    load: number
  } | null
  alternatives: Array<{
    id: string
    name: string
    avatarUrl: string | null
    overlap: number
    load: number
  }>
  proposedSlots: string[]
  reason?: string
}

type PendingEnrollmentRow = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  profiles: { id: string; name: string; avatar_url: string | null; availability: string[] | null } | null
  courses: {
    id: string
    name: string
    language: string
    level: string
    max_group_size: number
    sessions_per_week: number
    duration_weeks: number
  } | null
}

type TeacherRow = {
  id: string
  name: string
  avatar_url: string | null
  availability: string[] | null
}

export async function suggestGroupAssignments(): Promise<{ proposals?: ProposedGroup[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profileRaw } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profileRaw as { role: string } | null)?.role !== 'admin') return { error: 'Unauthorized' }

  // 1. Pending enrollments (with student availability + course details)
  const { data: pendingRaw } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, profiles:user_id(id, name, avatar_url, availability), courses(id, name, language, level, max_group_size, sessions_per_week, duration_weeks)')
    .eq('status', 'pending')
    .order('enrolled_at', { ascending: true })

  const pending = (pendingRaw ?? []) as unknown as PendingEnrollmentRow[]
  if (pending.length === 0) return { proposals: [] }

  // 2. Approved teacher map (course_id -> teachers with availability)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: approvalsRaw } = await (supabase as any)
    .from('course_teachers')
    .select('course_id, teacher_id, profiles:teacher_id(id, name, avatar_url, availability)')
    .eq('status', 'approved')

  const approvedByCourse = new Map<string, (TeacherRow)[]>()
  for (const row of (approvalsRaw ?? []) as { course_id: string; teacher_id: string; profiles: TeacherRow | null }[]) {
    if (!row.profiles) continue
    const list = approvedByCourse.get(row.course_id) ?? []
    list.push(row.profiles)
    approvedByCourse.set(row.course_id, list)
  }

  // 3. Active group load per teacher
  const { data: activeGroupsRaw } = await supabase.from('groups').select('teacher_id').eq('status', 'active')
  const loadByTeacher = new Map<string, number>()
  for (const row of (activeGroupsRaw ?? []) as { teacher_id: string | null }[]) {
    if (!row.teacher_id) continue
    loadByTeacher.set(row.teacher_id, (loadByTeacher.get(row.teacher_id) ?? 0) + 1)
  }

  // 4. Build proposals: chunk by course, then by max_group_size
  const byCourse = new Map<string, PendingEnrollmentRow[]>()
  for (const e of pending) {
    const list = byCourse.get(e.course_id) ?? []
    list.push(e)
    byCourse.set(e.course_id, list)
  }

  const proposals: ProposedGroup[] = []
  let batchIdx = 0

  for (const [courseId, students] of byCourse.entries()) {
    const course = students[0].courses
    if (!course) continue
    const groupSize = course.max_group_size ?? 2
    const approvedTeachers = approvedByCourse.get(courseId) ?? []

    for (let i = 0; i < students.length; i += groupSize) {
      const batch = students.slice(i, i + groupSize)

      // Student availability intersection
      const studentSets = batch.map(s => new Set(s.profiles?.availability ?? []))
      const studentIntersection = studentSets.length > 0
        ? [...studentSets[0]].filter(slot => studentSets.every(s => s.has(slot)))
        : []

      // Score teachers
      const scored = approvedTeachers.map(t => {
        const teacherSet = new Set(t.availability ?? [])
        const overlapSlots = studentIntersection.filter(slot => teacherSet.has(slot))
        return {
          teacher: t,
          overlap: overlapSlots.length,
          overlapSlots,
          load: loadByTeacher.get(t.id) ?? 0,
        }
      }).sort((a, b) => {
        if (a.overlap !== b.overlap) return b.overlap - a.overlap
        return a.load - b.load
      })

      const best = scored[0]
      const required = course.sessions_per_week
      let reason: string | undefined

      if (approvedTeachers.length === 0) {
        reason = 'No approved teachers for this course. Approve a teacher request first.'
      } else if (!best || best.overlap === 0) {
        reason = 'No overlapping availability between students and any approved teacher.'
      } else if (best.overlap < required) {
        reason = `Only ${best.overlap} overlapping slot(s) — course needs ${required}/week. Edit in builder to revisit.`
      }

      proposals.push({
        id: `prop-${courseId}-${batchIdx++}`,
        courseId,
        courseName: course.name,
        courseLanguage: course.language,
        courseLevel: course.level,
        sessionsPerWeek: course.sessions_per_week,
        durationWeeks: course.duration_weeks,
        maxGroupSize: course.max_group_size,
        enrollments: batch.map(e => ({
          enrollmentId: e.id,
          userId: e.user_id,
          name: e.profiles?.name ?? 'Unknown',
          avatarUrl: e.profiles?.avatar_url ?? null,
        })),
        proposedTeacher: best && best.overlap > 0 ? {
          id: best.teacher.id,
          name: best.teacher.name,
          avatarUrl: best.teacher.avatar_url,
          overlap: best.overlap,
          load: best.load,
        } : null,
        alternatives: scored.slice(1, 4).filter(s => s.overlap > 0).map(s => ({
          id: s.teacher.id,
          name: s.teacher.name,
          avatarUrl: s.teacher.avatar_url,
          overlap: s.overlap,
          load: s.load,
        })),
        proposedSlots: best ? best.overlapSlots.slice(0, required) : [],
        reason,
      })
    }
  }

  return { proposals }
}

function getNextMonday(): string {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const DAY_MAP: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

function generateSessions(groupId: string, weekStart: string, slots: string[], durationWeeks: number) {
  const sessions = []
  const start = new Date(weekStart)
  for (let week = 0; week < durationWeeks; week++) {
    for (const slot of slots) {
      const [dayStr, timeStr] = slot.split('-')
      const [hours, minutes] = timeStr.split(':').map(Number)
      const d = new Date(start)
      d.setUTCDate(d.getUTCDate() + week * 7 + (DAY_MAP[dayStr] ?? 0))
      d.setUTCHours(hours, minutes, 0, 0)
      sessions.push({ group_id: groupId, scheduled_at: d.toISOString(), duration_minutes: 60, status: 'scheduled' })
    }
  }
  return sessions
}

export async function reassignGroupTeacher(
  groupId: string,
  newTeacherId: string,
  slots: string[],
  requireAcceptance: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role: string } | null)?.role !== 'admin') return { error: 'Unauthorized' }

  if (slots.length === 0) return { error: 'At least one slot is required' }

  // Fetch group with course duration for session regeneration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group } = await (admin as any)
    .from('groups')
    .select('id, course_id, teacher_id, acceptance_status, declined_teachers, courses(duration_weeks)')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Group not found' }
  if (group.acceptance_status !== 'declined') return { error: 'Group is not in declined state' }

  // Block reassigning to a teacher who already declined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const declined: any[] = Array.isArray(group.declined_teachers) ? group.declined_teachers : []
  if (declined.some((d: { teacher_id: string }) => d.teacher_id === newTeacherId)) {
    return { error: 'This teacher already declined the proposal. Choose a different teacher.' }
  }

  // Verify new teacher is approved for this course
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: approval } = await (admin as any)
    .from('course_teachers')
    .select('id')
    .eq('teacher_id', newTeacherId)
    .eq('course_id', group.course_id)
    .eq('status', 'approved')
    .maybeSingle()
  if (!approval) return { error: 'Teacher is not approved to teach this course' }

  const now = new Date().toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const durationWeeks: number = (group.courses as any)?.duration_weeks ?? 8
  const weekStart = getNextMonday()

  // Update group: new teacher, fresh week_start, reset acceptance state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin as any).from('groups').update({
    teacher_id: newTeacherId,
    week_start: weekStart,
    acceptance_status: requireAcceptance ? 'pending_teacher' : 'accepted',
    proposed_at: requireAcceptance ? now : null,
    responded_at: null,
  }).eq('id', groupId)
  if (updateErr) return { error: updateErr.message }

  // Regenerate sessions with new slots (delete old, insert new)
  await admin.from('sessions').delete().eq('group_id', groupId)
  const newSessions = generateSessions(groupId, weekStart, slots, durationWeeks)
  const { error: sessErr } = await admin.from('sessions').insert(newSessions)
  if (sessErr) return { error: sessErr.message }

  // Swap teacher in the group's chat conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conv } = await (admin as any)
    .from('conversations')
    .select('id')
    .eq('group_id', groupId)
    .eq('type', 'group')
    .maybeSingle()
  if (conv) {
    await admin.from('conversation_participants').delete()
      .eq('conversation_id', conv.id).eq('user_id', group.teacher_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('conversation_participants')
      .upsert({ conversation_id: conv.id, user_id: newTeacherId }, { onConflict: 'conversation_id,user_id' })
  }

  // Count members for notification payload
  const { data: members } = await admin.from('group_members').select('user_id').eq('group_id', groupId)
  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)

  // Notify new teacher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('notifications').insert({
    user_id: newTeacherId,
    type: requireAcceptance ? 'group_proposed' : 'new_group_assigned',
    payload: { group_id: groupId, students: memberIds.length },
  })

  // If no acceptance required, flip enrollments + notify students immediately
  if (!requireAcceptance && memberIds.length > 0) {
    await admin.from('enrollments')
      .update({ status: 'assigned' })
      .eq('course_id', group.course_id)
      .in('user_id', memberIds)
      .eq('status', 'pending')
    for (const uid of memberIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('notifications').insert({
        user_id: uid,
        type: 'group_assigned',
        payload: { group_id: groupId },
      })
    }
  }

  revalidatePath('/admin/enrollments')
  revalidatePath('/teacher/proposals')
  return {}
}

export async function cancelPendingProposal(groupId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role: string } | null)?.role !== 'admin') return { error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group } = await (admin as any)
    .from('groups')
    .select('id, course_id, acceptance_status')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Group not found' }
  if (group.acceptance_status !== 'pending_teacher') return { error: 'Group is not pending teacher acceptance' }

  const { data: members } = await admin
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)

  if (memberIds.length > 0) {
    await admin
      .from('enrollments')
      .update({ status: 'pending' })
      .eq('course_id', group.course_id)
      .in('user_id', memberIds)
  }

  await admin.from('groups').delete().eq('id', groupId)

  revalidatePath('/admin/enrollments')
  return {}
}

export async function promoteToAdmin(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profileRaw } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profileRaw as { role: string } | null)?.role !== 'admin') return { success: false, message: 'Unauthorized' }

  const targetId = formData.get('userId') as string
  await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetId)
  revalidatePath('/admin/students')
  return { success: true, message: 'User promoted to admin' }
}

export async function resolveTeacherCourseRequest(requestId: string, status: 'approved' | 'rejected'): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role: string } | null)?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('course_teachers')
    .update({ status })
    .eq('id', requestId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/requests')
}

'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Course, Enrollment, Profile } from '@/lib/supabase/types'

type EnrollmentWithCourse = Enrollment & { courses: Course | null }

export async function assignGroups(): Promise<{ success: boolean; message: string; details?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profileRaw } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (profile?.role !== 'admin') return { success: false, message: 'Unauthorized' }

  const { data: pendingRaw } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('status', 'pending')
    .order('enrolled_at', { ascending: true })

  const pending = (pendingRaw ?? []) as unknown as EnrollmentWithCourse[]
  if (pending.length === 0) return { success: true, message: 'No pending enrollments to assign' }

  const { data: teachersRaw } = await supabase.from('profiles').select('id').eq('role', 'teacher')
  const teachers = (teachersRaw ?? []) as { id: string }[]
  if (teachers.length === 0) return { success: false, message: 'No teachers available' }

  const byCourse = pending.reduce<Record<string, EnrollmentWithCourse[]>>((acc, e) => {
    acc[e.course_id] = acc[e.course_id] ?? []
    acc[e.course_id].push(e)
    return acc
  }, {})

  let teacherIdx = 0
  const weekStart = getNextMonday()
  let totalGroups = 0
  let totalStudents = 0

  for (const [courseId, enrollments] of Object.entries(byCourse)) {
    const course = enrollments[0].courses
    if (!course) continue
    const groupSize = course.max_group_size ?? 2

    for (let i = 0; i < enrollments.length; i += groupSize) {
      const batch = enrollments.slice(i, i + groupSize)
      const teacher = teachers[teacherIdx % teachers.length]
      teacherIdx++

      const { data: groupRaw } = await supabase
        .from('groups')
        .insert([{ course_id: courseId, teacher_id: teacher.id, week_start: weekStart }])
        .select()
        .single()

      const group = groupRaw as { id: string } | null
      if (!group) continue

      await supabase.from('group_members').insert(
        batch.map(e => ({ group_id: group.id, user_id: e.user_id }))
      )

      await supabase.from('sessions').insert(generateSessions(group.id, weekStart, course.sessions_per_week, course.duration_weeks))

      await supabase
        .from('enrollments')
        .update({ status: 'assigned' })
        .in('id', batch.map(e => e.id))

      totalGroups++
      totalStudents += batch.length
    }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/enrollments')
  revalidatePath('/admin/groups')

  return {
    success: true,
    message: `Created ${totalGroups} group${totalGroups !== 1 ? 's' : ''} with ${totalStudents} student${totalStudents !== 1 ? 's' : ''}`,
    details: `Sessions start ${new Date(weekStart).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
  }
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

function getNextMonday(): string {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day))
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function generateSessions(groupId: string, weekStart: string, sessionsPerWeek: number, durationWeeks: number) {
  const sessions = []
  const start = new Date(weekStart)
  const dayOffsets = [0, 2, 4].slice(0, sessionsPerWeek)
  for (let w = 0; w < durationWeeks; w++) {
    for (const d of dayOffsets) {
      const dt = new Date(start)
      dt.setDate(dt.getDate() + w * 7 + d)
      dt.setHours(10, 0, 0, 0)
      sessions.push({ group_id: groupId, scheduled_at: dt.toISOString(), duration_minutes: 60, status: 'scheduled' })
    }
  }
  return sessions
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

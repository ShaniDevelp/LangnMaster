import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Course, Enrollment } from '@/lib/supabase/types'

type EnrollmentWithCourse = Enrollment & { courses: Course | null }

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pendingRaw } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('status', 'pending')
    .order('enrolled_at', { ascending: true })

  const pending = (pendingRaw ?? []) as unknown as EnrollmentWithCourse[]
  if (pending.length === 0) return NextResponse.json({ message: 'No pending enrollments' })

  const byCourse = pending.reduce<Record<string, EnrollmentWithCourse[]>>((acc, e) => {
    acc[e.course_id] = acc[e.course_id] ?? []
    acc[e.course_id].push(e)
    return acc
  }, {})

  const { data: teachersRaw } = await supabase.from('profiles').select('id').eq('role', 'teacher')
  const teachers = (teachersRaw ?? []) as { id: string }[]
  if (teachers.length === 0) return NextResponse.json({ error: 'No teachers available' }, { status: 500 })

  let teacherIdx = 0
  const weekStart = getNextMonday()
  const results: { course: string; groups: number; students: number }[] = []

  for (const [courseId, enrollments] of Object.entries(byCourse)) {
    const course = enrollments[0].courses
    if (!course) continue
    const groupSize = course.max_group_size ?? 2
    let groupsCreated = 0
    let studentsAssigned = 0

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

      const sessions = generateSessions(group.id, weekStart, course.sessions_per_week, course.duration_weeks)
      await supabase.from('sessions').insert(sessions)

      await supabase
        .from('enrollments')
        .update({ status: 'assigned' })
        .in('id', batch.map(e => e.id))

      groupsCreated++
      studentsAssigned += batch.length
    }

    results.push({ course: courseId, groups: groupsCreated, students: studentsAssigned })
  }

  return NextResponse.json({ success: true, results })
}

function getNextMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function generateSessions(groupId: string, weekStart: string, sessionsPerWeek: number, durationWeeks: number) {
  const sessions = []
  const start = new Date(weekStart)
  const sessionDayOffsets = [0, 2, 4].slice(0, sessionsPerWeek)

  for (let week = 0; week < durationWeeks; week++) {
    for (const dayOffset of sessionDayOffsets) {
      const d = new Date(start)
      d.setDate(d.getDate() + week * 7 + dayOffset)
      d.setHours(10, 0, 0, 0)
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

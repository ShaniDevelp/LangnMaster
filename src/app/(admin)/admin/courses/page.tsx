import { createAdminClient } from '@/lib/supabase/server'
import { CoursesClient } from './CoursesClient'
import type { Course } from '@/lib/supabase/types'

export type CourseWithStats = Course & {
  enrollmentCount: number
  groupCount: number
}

export default async function AdminCoursesPage() {
  const admin = createAdminClient()

  const { data: coursesRaw } = await admin
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  const courses = (coursesRaw ?? []) as Course[]

  // Aggregate enrollment + group counts per course in two flat queries
  const [{ data: enrollRows }, { data: groupRows }] = await Promise.all([
    admin.from('enrollments').select('course_id'),
    admin.from('groups').select('course_id'),
  ])

  const enrollByCourse = new Map<string, number>()
  for (const r of (enrollRows ?? []) as { course_id: string }[]) {
    enrollByCourse.set(r.course_id, (enrollByCourse.get(r.course_id) ?? 0) + 1)
  }
  const groupByCourse = new Map<string, number>()
  for (const r of (groupRows ?? []) as { course_id: string }[]) {
    groupByCourse.set(r.course_id, (groupByCourse.get(r.course_id) ?? 0) + 1)
  }

  const withStats: CourseWithStats[] = courses.map(c => ({
    ...c,
    enrollmentCount: enrollByCourse.get(c.id) ?? 0,
    groupCount: groupByCourse.get(c.id) ?? 0,
  }))

  return <CoursesClient courses={withStats} />
}

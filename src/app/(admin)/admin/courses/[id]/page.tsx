import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Course, CourseModule } from '@/lib/supabase/types'
import { CourseDetailClient } from './CourseDetailClient'

export type CourseStats = {
  enrollmentsByStatus: Record<string, number>
  totalEnrollments: number
  groupsByStatus: Record<string, number>
  totalGroups: number
}

export type EnrolledStudent = {
  id: string
  name: string
  avatarUrl: string | null
  status: string
  enrolledAt: string
}

export type CourseTeacherInfo = {
  id: string
  name: string
  avatarUrl: string | null
  status: string
}

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: courseRaw } = await admin.from('courses').select('*').eq('id', id).single()
  const course = courseRaw as (Course & { outcomes?: string[] }) | null
  if (!course) notFound()

  const [
    { data: enrollRows },
    { data: groupRows },
    { data: moduleRows },
    { data: studentRows },
    { data: teacherRows },
  ] = await Promise.all([
    admin.from('enrollments').select('status').eq('course_id', id),
    admin.from('groups').select('status').eq('course_id', id),
    admin.from('course_modules').select('*').eq('course_id', id).order('week_number'),
    admin
      .from('enrollments')
      .select('status, enrolled_at, profiles:user_id(id, name, avatar_url)')
      .eq('course_id', id)
      .order('enrolled_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('course_teachers')
      .select('status, profiles!course_teachers_teacher_id_fkey(id, name, avatar_url)')
      .eq('course_id', id),
  ])

  const modules = (moduleRows ?? []) as CourseModule[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const students: EnrolledStudent[] = ((studentRows ?? []) as any[])
    .filter(r => r.profiles)
    .map(r => ({
      id: r.profiles.id,
      name: r.profiles.name,
      avatarUrl: r.profiles.avatar_url,
      status: r.status,
      enrolledAt: r.enrolled_at,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teachers: CourseTeacherInfo[] = ((teacherRows ?? []) as any[])
    .filter(r => r.profiles)
    .map(r => ({
      id: r.profiles.id,
      name: r.profiles.name,
      avatarUrl: r.profiles.avatar_url,
      status: r.status,
    }))

  const enrollmentsByStatus: Record<string, number> = {}
  for (const r of (enrollRows ?? []) as { status: string }[]) {
    enrollmentsByStatus[r.status] = (enrollmentsByStatus[r.status] ?? 0) + 1
  }
  const groupsByStatus: Record<string, number> = {}
  for (const r of (groupRows ?? []) as { status: string }[]) {
    groupsByStatus[r.status] = (groupsByStatus[r.status] ?? 0) + 1
  }

  const stats: CourseStats = {
    enrollmentsByStatus,
    totalEnrollments: (enrollRows ?? []).length,
    groupsByStatus,
    totalGroups: (groupRows ?? []).length,
  }

  return (
    <CourseDetailClient
      course={course}
      stats={stats}
      modules={modules}
      students={students}
      teachers={teachers}
    />
  )
}

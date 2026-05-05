'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Course, CourseModule } from '@/lib/supabase/types'

export async function getCourseDetails(courseId: string, currentUserId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  
  // 1. Fetch data. We use admin client for counts to bypass RLS restrictions
  // which might prevent teachers from seeing total enrollments or other teachers.
  const [
    { data: course },
    { data: modules },
    { count: teachersCount },
    { count: enrollmentsCount },
    { data: otherTeachers },
    { data: currentTeacherStatus }
  ] = await Promise.all([
    admin.from('courses').select('*').eq('id', courseId).single(),
    admin.from('course_modules').select('*').eq('course_id', courseId).order('week_number'),
    admin.from('course_teachers').select('*', { count: 'exact', head: true }).eq('course_id', courseId).eq('status', 'approved'),
    admin.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', courseId),
    admin.from('course_teachers')
      .select('teacher_id, profiles(id, name, avatar_url)')
      .eq('course_id', courseId)
      .eq('status', 'approved')
      .neq('teacher_id', currentUserId)
      .limit(5),
    supabase.from('course_teachers')
      .select('status')
      .eq('course_id', courseId)
      .eq('teacher_id', currentUserId)
      .maybeSingle()
  ])

  // 2. Fetch students from groups using admin client
  let groupMembersCount = 0
  const { data: groups } = await admin.from('groups').select('id').eq('course_id', courseId)
  if (groups && groups.length > 0) {
    const groupIds = groups.map(g => g.id)
    const { count } = await admin
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .in('group_id', groupIds)
    groupMembersCount = count ?? 0
  }

  // Final student count is the higher of enrollments or group members
  const finalStudentsCount = Math.max(enrollmentsCount ?? 0, groupMembersCount)
  const isApproved = currentTeacherStatus?.status === 'approved'

  return {
    course: course as Course,
    modules: (modules ?? []) as CourseModule[],
    teachersCount: teachersCount ?? 0,
    otherTeachersCount: Math.max(0, (teachersCount ?? 0) - (isApproved ? 1 : 0)),
    studentsCount: finalStudentsCount,
    otherTeachers: (otherTeachers ?? []).map(ot => (ot.profiles as any))
  }
}

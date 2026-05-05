import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvailableCoursesClient } from './AvailableCoursesClient'

export default async function TeacherCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch available courses and the teacher's current request status
  const { data: coursesRaw } = await supabase
    .from('courses')
    .select('*, course_teachers(teacher_id, status)')
    .eq('is_active', true)
    .eq('course_teachers.teacher_id', user.id)

  const availableCourses = (coursesRaw ?? []).map(c => ({
    id: c.id,
    name: c.name,
    language: c.language,
    level: c.level,
    sessions_per_week: c.sessions_per_week,
    duration_weeks: c.duration_weeks,
    status: (c.course_teachers as any)?.[0]?.status ?? 'none'
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Catalog</h1>
        <p className="text-gray-500 mt-2">Browse active courses, view detailed curriculums, and request to teach subjects that match your expertise.</p>
      </div>

      <AvailableCoursesClient courses={availableCourses} currentUserId={user.id} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Course, Enrollment } from '@/lib/supabase/types'

const levelColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
}

const langEmoji: Record<string, string> = {
  English: '🇬🇧', Spanish: '🇪🇸', French: '🇫🇷', German: '🇩🇪', Mandarin: '🇨🇳',
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: coursesRaw }, { data: enrollmentsRaw }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('created_at'),
    supabase.from('enrollments').select('course_id, status').eq('user_id', user.id),
  ])

  const courses = (coursesRaw ?? []) as Course[]
  const enrollments = (enrollmentsRaw ?? []) as Pick<Enrollment, 'course_id' | 'status'>[]
  const enrolledIds = new Set(enrollments.map(e => e.course_id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Live small-group language courses. New cohorts every Monday.</p>
      </div>

      <div className="space-y-4">
        {courses.map(course => (
          <Link key={course.id} href={`/student/courses/${course.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-purple-200 hover:shadow-md transition-all">
              <div className="flex items-stretch">
                <div className="w-20 bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-3xl flex-shrink-0">
                  {langEmoji[course.language] ?? '🌍'}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{course.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${levelColor[course.level]}`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>📅 {course.sessions_per_week}x/week</span>
                    <span>🗓 {course.duration_weeks} weeks</span>
                    <span>👥 {course.max_group_size} students</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">${course.price_usd}</span>
                {enrolledIds.has(course.id) ? (
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                    ✓ Enrolled
                  </span>
                ) : (
                  <span className="text-xs font-semibold bg-[#6c4ff5] text-white px-3 py-1.5 rounded-full">
                    Enroll →
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

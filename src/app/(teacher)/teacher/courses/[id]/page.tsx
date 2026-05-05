import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Course, CourseModule } from '@/lib/supabase/types'
import { TeacherRequestButton } from './TeacherRequestButton'

export default async function TeacherCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: courseRaw },
    { data: modulesRaw },
    { data: teacherStatusRaw },
    { count: teachersCount },
    { count: studentsCount }
  ] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).single(),
    supabase.from('course_modules').select('*').eq('course_id', id).order('week_number'),
    supabase.from('course_teachers').select('status').eq('course_id', id).eq('teacher_id', user.id).maybeSingle(),
    supabase.from('course_teachers').select('*', { count: 'exact', head: true }).eq('course_id', id).eq('status', 'approved'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', id)
  ])

  if (!courseRaw) notFound()

  const course = courseRaw as Course
  const modules = (modulesRaw ?? []) as CourseModule[]
  const currentStatus = (teacherStatusRaw?.status as 'none' | 'pending' | 'approved' | 'rejected') ?? 'none'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/teacher/courses" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-6">
        ← Back to Catalog
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Curriculum */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-brand-50 text-brand-600 uppercase">
                {course.language} · {course.level}
              </span>
              <span className="text-xs font-medium text-gray-400">
                Course ID: {course.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {course.name}
            </h1>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{teachersCount ?? 0}</p>
              <p className="text-xs text-gray-400 uppercase font-semibold">Approved Teachers</p>
            </div>
            <div className="text-center border-x border-gray-50">
              <p className="text-2xl font-bold text-gray-900">{studentsCount ?? 0}</p>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{course.duration_weeks}</p>
              <p className="text-xs text-gray-400 uppercase font-semibold">Duration (Weeks)</p>
            </div>
          </div>

          {/* Curriculum */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
            {modules.length > 0 ? (
              <div className="space-y-3">
                {modules.map(mod => (
                  <div key={mod.id} className="group border border-gray-50 rounded-2xl overflow-hidden bg-gray-50/30">
                    <div className="px-5 py-4 flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {mod.week_number}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{mod.title}</h3>
                        <p className="text-xs text-gray-500">{mod.topics.length} topics covered</p>
                      </div>
                    </div>
                    <div className="px-5 pb-4 pl-16">
                      <ul className="space-y-2">
                        {mod.topics.map((t, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-brand-300 mt-1.5 w-1 h-1 rounded-full bg-brand-400 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 italic">No curriculum modules published for this course yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teaching Interest</h3>
            <p className="text-sm text-gray-500 mb-6">
              LangMaster courses are taught by native-level instructors. By applying, you agree to follow the standard curriculum and assessment guidelines.
            </p>
            
            <TeacherRequestButton courseId={course.id} initialStatus={currentStatus} />

            <div className="mt-8 pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">💰</span>
                <div>
                  <p className="font-semibold">Instructor Pay</p>
                  <p className="text-xs text-gray-400">Competitive hourly rates based on expertise.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">🕒</span>
                <div>
                  <p className="font-semibold">Schedule</p>
                  <p className="text-xs text-gray-400">{course.sessions_per_week} sessions/week · 60m each</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

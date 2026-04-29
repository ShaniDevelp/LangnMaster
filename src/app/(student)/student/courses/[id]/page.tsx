import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { enrollInCourse } from '@/lib/student/actions'
import type { Course, Enrollment } from '@/lib/supabase/types'

const langEmoji: Record<string, string> = {
  English: '🇬🇧', Spanish: '🇪🇸', French: '🇫🇷', German: '🇩🇪', Mandarin: '🇨🇳',
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: courseRaw }, { data: enrollmentRaw }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).single(),
    supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
  ])

  if (!courseRaw) notFound()

  const course = courseRaw as Course
  const enrollment = enrollmentRaw as Enrollment | null

  const nextMonday = (() => {
    const d = new Date()
    const day = d.getDay()
    const diff = day === 0 ? 1 : 8 - day
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6c4ff5] to-indigo-600 text-white rounded-3xl p-6">
        <div className="text-4xl mb-3">{langEmoji[course.language] ?? '🌍'}</div>
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-purple-200 text-sm mt-1">{course.language} · {course.level}</p>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-2">About this course</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '📅', label: 'Sessions', value: `${course.sessions_per_week}x per week` },
          { icon: '🗓', label: 'Duration', value: `${course.duration_weeks} weeks` },
          { icon: '👥', label: 'Group size', value: `${course.max_group_size} students` },
          { icon: '💰', label: 'Price', value: `$${course.price_usd}` },
        ].map(d => (
          <div key={d.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <span className="text-xl">{d.icon}</span>
            <p className="text-xs text-gray-400 mt-1">{d.label}</p>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">{d.value}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-purple-50 rounded-2xl p-5">
        <h3 className="font-bold text-purple-900 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-purple-700">
          <li className="flex gap-2"><span className="font-bold">1.</span> Enroll today — joins the {nextMonday} cohort</li>
          <li className="flex gap-2"><span className="font-bold">2.</span> Paired with 1 other student at similar level</li>
          <li className="flex gap-2"><span className="font-bold">3.</span> Assigned an expert teacher for your group</li>
          <li className="flex gap-2"><span className="font-bold">4.</span> {course.sessions_per_week} live video sessions per week</li>
        </ol>
      </div>

      {/* Enroll */}
      {enrollment ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-green-700 font-semibold">✓ You are enrolled</p>
          <p className="text-green-600 text-sm mt-1">Status: {enrollment.status}</p>
        </div>
      ) : (
        <form action={enrollInCourse}>
          <input type="hidden" name="courseId" value={course.id} />
          <button
            type="submit"
            className="w-full bg-[#6c4ff5] text-white font-bold py-4 rounded-2xl text-lg hover:bg-[#5c3de8] transition-colors shadow-lg shadow-purple-200"
          >
            Enroll — ${course.price_usd}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Sessions start {nextMonday}</p>
        </form>
      )}
    </div>
  )
}

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CourseFilters } from '@/components/CourseFilters'
import type { Course, Enrollment } from '@/lib/supabase/types'

// Static ratings until reviews table is added in Stage 3
const MOCK_RATINGS: Record<string, { rating: number; count: number }> = {
  'English for Beginners':   { rating: 4.8, count: 342 },
  'Business English':        { rating: 4.9, count: 218 },
  'Advanced English Fluency':{ rating: 4.7, count: 156 },
  'Spanish Basics':          { rating: 4.8, count: 204 },
  'French Immersion':        { rating: 4.6, count: 98 },
}

const LANG_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  English:   { emoji: '🇬🇧', gradient: 'from-blue-500 to-indigo-600' },
  Spanish:   { emoji: '🇪🇸', gradient: 'from-red-500 to-orange-500' },
  French:    { emoji: '🇫🇷', gradient: 'from-blue-600 to-blue-800' },
  German:    { emoji: '🇩🇪', gradient: 'from-yellow-500 to-amber-600' },
  Mandarin:  { emoji: '🇨🇳', gradient: 'from-red-600 to-red-800' },
  Japanese:  { emoji: '🇯🇵', gradient: 'from-pink-400 to-rose-600' },
  Korean:    { emoji: '🇰🇷', gradient: 'from-blue-400 to-indigo-500' },
  Arabic:    { emoji: '🇸🇦', gradient: 'from-green-600 to-emerald-700' },
}

const LEVEL_STYLE: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced:     'bg-purple-100 text-purple-700',
}

function nextCohortLabel(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntil = day === 1 ? 7 : day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntil)
  return monday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function ratingForCourse(course: Course) {
  const known = MOCK_RATINGS[course.name]
  if (known) return known
  // Deterministic fallback from id chars
  const n = (course.id.charCodeAt(0) + course.id.charCodeAt(1)) % 5
  return { rating: Number((4.5 + n * 0.1).toFixed(1)), count: 50 + n * 30 }
}

function sortCourses(
  courses: Course[],
  sort: string,
): Course[] {
  const c = [...courses]
  if (sort === 'price_asc') return c.sort((a, b) => Number(a.price_usd) - Number(b.price_usd))
  if (sort === 'price_desc') return c.sort((a, b) => Number(b.price_usd) - Number(a.price_usd))
  if (sort === 'duration_asc') return c.sort((a, b) => a.duration_weeks - b.duration_weeks)
  // popular = by rating desc
  return c.sort((a, b) => ratingForCourse(b).rating - ratingForCourse(a).rating)
}

type SearchParams = Promise<{ lang?: string; level?: string; sort?: string }>

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: coursesRaw }, { data: enrollmentsRaw }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('created_at'),
    supabase.from('enrollments').select('course_id, status').eq('user_id', user.id),
  ])

  let courses = (coursesRaw ?? []) as Course[]
  const enrollments = (enrollmentsRaw ?? []) as Pick<Enrollment, 'course_id' | 'status'>[]
  const enrolledMap = new Map(enrollments.map(e => [e.course_id, e.status]))

  // Unique languages for filter bar
  const languages = [...new Set(courses.map(c => c.language))].sort()

  // Apply filters
  if (params.lang && params.lang !== 'all') courses = courses.filter(c => c.language === params.lang)
  if (params.level && params.level !== 'all') courses = courses.filter(c => c.level === params.level)
  courses = sortCourses(courses, params.sort ?? 'popular')

  const cohortDate = nextCohortLabel()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Live small-group classes. New cohorts every Monday.</p>
      </div>

      {/* Filters — needs Suspense because CourseFilters uses useSearchParams */}
      <Suspense fallback={<div className="h-16 rounded-xl bg-gray-100 animate-pulse" />}>
        <CourseFilters languages={languages} />
      </Suspense>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
      </p>

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No courses match your filters.</p>
          <p className="text-sm mt-1">Try adjusting language or level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const cfg = LANG_CONFIG[course.language] ?? { emoji: '🌍', gradient: 'from-gray-400 to-gray-600' }
            const { rating, count } = ratingForCourse(course)
            const enrollStatus = enrolledMap.get(course.id)

            return (
              <Link key={course.id} href={`/student/courses/${course.id}`} className="group block">
                <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-brand-200 hover:shadow-md transition-all h-full flex flex-col">
                  {/* Card header */}
                  <div className={`relative h-24 bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                    <span className="text-4xl">{cfg.emoji}</span>
                    {/* Level badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${LEVEL_STYLE[course.level]}`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    {/* Title + rating */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-brand-600 transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0 text-xs text-gray-500">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium text-gray-700">{rating}</span>
                      </div>
                    </div>

                    {/* Language + reviews */}
                    <p className="text-xs text-gray-400 mb-3">
                      {course.language} · {count} reviews
                    </p>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <MetaPill icon="📅">{course.sessions_per_week}× / week</MetaPill>
                      <MetaPill icon="🗓">{course.duration_weeks} weeks</MetaPill>
                      <MetaPill icon="👥">{course.max_group_size} students</MetaPill>
                    </div>

                    {/* Cohort date */}
                    <p className="text-xs text-brand-600 font-medium mb-4">
                      Next cohort: {cohortDate}
                    </p>

                    {/* Price + CTA */}
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">${course.price_usd}</span>
                        <span className="text-xs text-gray-400 ml-1">/ course</span>
                      </div>
                      {enrollStatus ? (
                        <EnrollBadge status={enrollStatus} />
                      ) : (
                        <span className="text-xs font-semibold bg-brand-500 text-white px-3 py-1.5 rounded-full group-hover:bg-brand-600 transition-colors">
                          View & Enroll →
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetaPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-[11px] font-medium px-2 py-1 rounded-full">
      {icon} {children}
    </span>
  )
}

function EnrollBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: '⏳ Pending', cls: 'bg-yellow-100 text-yellow-700' },
    assigned:  { label: '✓ Assigned', cls: 'bg-blue-100 text-blue-700' },
    active:    { label: '✓ Active', cls: 'bg-green-100 text-green-700' },
    completed: { label: '✓ Done', cls: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  )
}

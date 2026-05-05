import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import type { Course, Enrollment, CourseModule, Review, Profile } from '@/lib/supabase/types'

// ── Static config ─────────────────────────────────────────────────────────────

const LANG_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  English: { emoji: '🇬🇧', gradient: 'from-blue-500 to-indigo-600' },
  Spanish: { emoji: '🇪🇸', gradient: 'from-red-500 to-orange-500' },
  French: { emoji: '🇫🇷', gradient: 'from-blue-600 to-blue-800' },
  German: { emoji: '🇩🇪', gradient: 'from-yellow-500 to-amber-600' },
  Mandarin: { emoji: '🇨🇳', gradient: 'from-red-600 to-red-800' },
  Japanese: { emoji: '🇯🇵', gradient: 'from-pink-400 to-rose-600' },
  Korean: { emoji: '🇰🇷', gradient: 'from-blue-400 to-indigo-500' },
  Arabic: { emoji: '🇸🇦', gradient: 'from-green-600 to-emerald-700' },
}

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

const FAQ = [
  { q: 'What if I miss a session?', a: 'You can reschedule up to 2 sessions per course. If your partner misses, the class continues 1-on-1 with your teacher.' },
  { q: 'Can I change my group?', a: 'Group changes are possible if you contact support within the first 2 weeks. After that, groups are kept stable for consistency.' },
  { q: 'What if I want a refund?', a: 'Full refund within 7 days of enrollment if you have attended fewer than 2 sessions. After that, pro-rated course credit is issued.' },
  { q: 'How are session times decided?', a: 'Your teacher proposes times based on your group\'s shared availability. You confirm before the first session.' },
  { q: 'Will I have the same teacher all course?', a: 'Yes. One teacher, same group, whole course. Consistency is core to how LangMaster works.' },
]

const AVATAR_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500',
  'from-cyan-400 to-blue-500',
]

// ── Data helpers ──────────────────────────────────────────────────────────────

function nextCohortDate(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntil = day === 1 ? 7 : day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntil)
  return monday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function ratingDistribution(reviews: Review[]): { star: number; count: number; pct: number }[] {
  const total = reviews.length
  return [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length
    return { star, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  })
}

function avgRating(reviews: Review[]): string {
  if (!reviews.length) return '–'
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return avg.toFixed(1)
}

function prereqMet(course: Course, profile: Profile & { levels?: Record<string, string> | null }): boolean {
  if (course.level === 'beginner') return true
  const studentLevel = profile.levels?.[course.language]
  if (!studentLevel) return false
  const required = LEVEL_ORDER.indexOf(course.level)
  const student = LEVEL_ORDER.indexOf(studentLevel.toLowerCase())
  return student >= required - 1
}

// ── Page ──────────────────────────────────────────────────────────────────────

type CourseTeacherRow = {
  teacher_id: string
  profiles: Pick<Profile, 'id' | 'name' | 'bio' | 'avatar_url'> & {
    years_experience?: number
    certifications?: string[]
    languages_taught?: { lang: string; proficiency: string }[]
    rating?: number
    review_count?: number
  } | null
}

type ReviewRow = Review & { profiles: Pick<Profile, 'name'> | null }

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: courseRaw },
    { data: enrollmentRaw },
    { data: profileRaw },
    { data: modulesRaw },
    { data: teachersRaw },
    { data: reviewsRaw },
  ] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).single(),
    supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('course_modules').select('*').eq('course_id', id).order('week_number'),
    supabase
      .from('course_teachers')
      .select('teacher_id, profiles!course_teachers_teacher_id_fkey(id, name, bio, avatar_url, years_experience, certifications, languages_taught, rating, review_count)')
      .eq('course_id', id)
      .eq('status', 'approved'),
    supabase
      .from('reviews')
      .select('*, profiles:student_id(name)')
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (!courseRaw) notFound()

  const course = courseRaw as Course & { outcomes?: string[] }
  const enrollment = enrollmentRaw as Enrollment | null
  const profile = profileRaw as (Profile & { levels?: Record<string, string> | null }) | null
  const modules = (modulesRaw ?? []) as CourseModule[]
  const teachers = (teachersRaw ?? []) as unknown as CourseTeacherRow[]
  const reviews = (reviewsRaw ?? []) as unknown as ReviewRow[]

  const cfg = LANG_CONFIG[course.language] ?? { emoji: '🌍', gradient: 'from-gray-400 to-gray-600' }
  const cohortDate = nextCohortDate()
  const dist = ratingDistribution(reviews)
  const avg = avgRating(reviews)
  const canEnroll = profile ? prereqMet(course, profile) : true
  const outcomes: string[] = course.outcomes?.length
    ? course.outcomes
    : defaultOutcomes(course.language, course.level)

  return (
    <div className="space-y-0">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/student/courses" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          ← Back to courses
        </Link>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${cfg.gradient} text-white rounded-3xl p-6 sm:p-8 mb-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-5xl mb-4">{cfg.emoji}</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-white/80">{course.language}</span>
              <span className="text-white/40">·</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize bg-white/20`}>
                {course.level}
              </span>
              {reviews.length > 0 && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-sm text-white/80">★ {avg} ({reviews.length} reviews)</span>
                </>
              )}
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg">{course.description}</p>
          </div>
        </div>
        {/* Quick stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: '📅', label: 'Sessions', val: `${course.sessions_per_week}× / week` },
            { icon: '🗓', label: 'Duration', val: `${course.duration_weeks} weeks` },
            { icon: '👥', label: 'Group size', val: `${course.max_group_size} students` },
            { icon: '📆', label: 'Starts', val: cohortDate.split(',')[0] },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-3">
              <p className="text-xs text-white/60 mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-white">{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-col layout ─────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

        {/* ── Left: content ───────────────────────────────────── */}
        <div className="space-y-6">

          {/* What you'll learn */}
          <Section title="What you'll learn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  <p className="text-sm text-gray-700">{o}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Curriculum */}
          {modules.length > 0 && (
            <Section title="Week-by-week curriculum">
              <div className="space-y-2">
                {modules.map(mod => (
                  <details key={mod.id} className="group border border-gray-100 rounded-2xl overflow-hidden open:border-brand-200">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-white hover:bg-gray-50 open:bg-purple-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {mod.week_number}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">{mod.title}</span>
                      </div>
                      <span className="text-brand-500 text-lg leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
                    </summary>
                    <div className="px-5 pb-4 pt-2 bg-white">
                      <ul className="space-y-1.5">
                        {mod.topics.map((t, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-300 mt-1">–</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </Section>
          )}

          {/* Teachers */}
          <Section title="Your teachers">
            <p className="text-sm text-gray-500 mb-4">
              You&apos;ll be assigned one of these teachers based on your timezone and availability.
            </p>
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teachers.map((t, i) => (
                  <TeacherCard key={t.teacher_id} teacher={t} gradient={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} />
                ))}
              </div>
            ) : (
              <div className="bg-purple-50 rounded-2xl p-5 text-center text-sm text-purple-700">
                Teacher pool for this course will be published soon. All LangMaster teachers are vetted native or certified speakers.
              </div>
            )}
          </Section>

          {/* Reviews */}
          <Section title={`Student reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}`}>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {/* Rating summary */}
                <div className="flex items-start gap-6">
                  <div className="text-center flex-shrink-0">
                    <p className="text-5xl font-extrabold text-gray-900">{avg}</p>
                    <div className="text-yellow-400 text-lg mt-1">{'★'.repeat(Math.round(Number(avg)))}</div>
                    <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {dist.map(d => (
                      <div key={d.star} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-4 text-right">{d.star}★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="w-8">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.profiles?.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.profiles?.name ?? 'Student'}</p>
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            {'★'.repeat(r.rating)}
                            <span className="text-gray-400 ml-1">
                              {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-sm">No reviews yet for this course.</p>
                <p className="text-xs mt-1">Be the first cohort — your review will help future students.</p>
              </div>
            )}
          </Section>

          {/* How groups work */}
          <Section title="How your group works">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '👥', title: 'You + 1 partner', desc: 'Matched by level and timezone. Max 2 students per group — you speak every single session.' },
                { icon: '🧑‍🏫', title: 'One teacher', desc: 'Same teacher all course. They learn your strengths and weaknesses and push you accordingly.' },
                { icon: '📅', title: 'Fixed schedule', desc: 'Your group agrees on session times before week one. Consistent schedule, no rescheduling chaos.' },
              ].map(item => (
                <div key={item.title} className="bg-purple-50 rounded-2xl p-5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* FAQ */}
          <Section title="Common questions">
            <div className="space-y-2">
              {FAQ.map(item => (
                <details
                  key={item.q}
                  className="group border border-gray-100 rounded-2xl overflow-hidden open:border-brand-200"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-white hover:bg-gray-50 open:bg-purple-50 transition-colors">
                    <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                    <span className="text-brand-500 text-lg leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-4 pt-2 bg-white">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </Section>

          {/* Mobile enroll CTA */}
          <div className="lg:hidden">
            <EnrollBlock course={course} enrollment={enrollment} cohortDate={cohortDate} canEnroll={canEnroll} />
          </div>
        </div>

        {/* ── Right: sticky enroll card (desktop only) ─────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <EnrollBlock course={course} enrollment={enrollment} cohortDate={cohortDate} canEnroll={canEnroll} />
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      {!enrollment && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-gray-100 px-4 py-3 pb-safe flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">Per course</p>
            <p className="text-xl font-bold text-gray-900">${course.price_usd}</p>
          </div>
          {canEnroll ? (
            <Link
              href={`/student/courses/${course.id}/checkout`}
              className="flex-1 bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors text-center text-sm"
            >
              Enroll — ${course.price_usd}
            </Link>
          ) : (
            <span className="flex-1 bg-gray-200 text-gray-400 font-bold py-3 rounded-xl text-center text-sm cursor-not-allowed">
              Level too low
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function TeacherCard({ teacher, gradient }: { teacher: CourseTeacherRow; gradient: string }) {
  const p = teacher.profiles
  return (
    <div className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:border-brand-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {p?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{p?.name ?? 'Teacher'}</p>
          {p && (
            <p className="text-xs text-gray-400">{p.years_experience ?? 0}y exp · ★ {Number(p.rating ?? 0).toFixed(1)}</p>
          )}
        </div>
      </div>
      {p?.languages_taught && p.languages_taught.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.languages_taught.map(l => (
            <span key={l.lang} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l.lang}</span>
          ))}
        </div>
      )}
      {p?.bio && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{p.bio}</p>}
      <Link 
        href={`/teachers/${teacher.teacher_id}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="mt-2 text-center py-2.5 rounded-xl border-2 border-brand-100 text-brand-600 font-bold text-xs hover:bg-brand-50 hover:border-brand-200 transition-all flex items-center justify-center gap-2"
      >
        <span>View Full Profile</span>
        <span className="text-[10px]">→</span>
      </Link>
    </div>
  )
}

function EnrollBlock({
  course,
  enrollment,
  cohortDate,
  canEnroll,
}: {
  course: Course & { outcomes?: string[] }
  enrollment: Enrollment | null
  cohortDate: string
  canEnroll: boolean
}) {
  if (enrollment) {
    return (
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">✓</div>
          <div>
            <p className="font-bold text-gray-900">You&apos;re enrolled</p>
            <p className="text-sm text-gray-400 capitalize">Status: {enrollment.status}</p>
          </div>
        </div>
        <Link
          href="/student/dashboard"
          className="block text-center bg-brand-50 text-brand-600 font-semibold py-3 rounded-xl hover:bg-brand-100 transition-colors text-sm"
        >
          Go to dashboard →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-5">
      <div>
        <p className="text-3xl font-extrabold text-gray-900">${course.price_usd}</p>
        <p className="text-sm text-gray-400">one-time · per course</p>
      </div>

      <div className="space-y-2 text-sm">
        {[
          { icon: '📅', text: `${course.sessions_per_week} live sessions per week` },
          { icon: '🗓', text: `${course.duration_weeks}-week course` },
          { icon: '👥', text: 'Group of 2 students' },
          { icon: '📆', text: `Starts ${cohortDate}` },
          { icon: '↩️', text: '7-day refund guarantee' },
        ].map(i => (
          <div key={i.text} className="flex items-center gap-2 text-gray-600">
            <span>{i.icon}</span> {i.text}
          </div>
        ))}
      </div>

      {!canEnroll && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          ⚠️ Your current {course.language} level may not meet the prerequisite for this course. Consider starting with a lower level.
        </div>
      )}

      {canEnroll ? (
        <Link
          href={`/student/courses/${course.id}/checkout`}
          className="block w-full text-center bg-brand-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200"
        >
          Enroll — ${course.price_usd}
        </Link>
      ) : (
        <button
          disabled
          className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-2xl text-base cursor-not-allowed"
        >
          Level too low to enroll
        </button>
      )}

      <p className="text-xs text-center text-gray-400">
        Secure payment · 7-day refund guarantee
      </p>
    </div>
  )
}

// ── Default outcomes per level ────────────────────────────────────────────────

function defaultOutcomes(language: string, level: string): string[] {
  if (level === 'beginner') return [
    `Introduce yourself and hold basic conversations in ${language}`,
    'Ask and answer simple questions about everyday topics',
    'Understand common vocabulary for travel and daily life',
    'Read and write basic sentences with correct grammar',
    'Develop confidence speaking from day one',
    'Build a foundation for intermediate study',
  ]
  if (level === 'intermediate') return [
    `Hold fluid conversations in ${language} on a wide range of topics`,
    'Understand native speakers in real-world settings',
    'Express opinions, feelings, and abstract ideas clearly',
    'Master complex grammar structures and idiomatic language',
    'Read news articles and informal writing with confidence',
    'Prepare for professional or academic use of the language',
  ]
  return [
    `Achieve near-native fluency in ${language}`,
    'Discuss nuanced topics including culture, politics, and philosophy',
    'Understand regional accents and colloquial speech',
    'Write formal and informal texts with precision',
    'Correct your own errors and self-edit in real time',
    'Engage at a professional or academic level',
  ]
}

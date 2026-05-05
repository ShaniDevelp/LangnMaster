import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Profile, Review, Course } from '@/lib/supabase/types'

type TeacherProfile = {
  user_id: string
  intro_video_url: string | null
  years_experience: number
  certifications: string[]
  languages_taught: { lang: string; proficiency: string }[]
  rating: number
  review_count: number
}

type ReviewRow = Review & {
  profiles: Pick<Profile, 'name' | 'avatar_url'> | null
  courses: Pick<Course, 'name' | 'language'> | null
}

const PROFICIENCY_LABELS: Record<string, string> = {
  native: 'Native', near_native: 'Near-native', fluent: 'Fluent',
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

export default async function PublicTeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (admin as any)
    .from('profiles')
    .select('id, name, bio, avatar_url, created_at, intro_video_url, years_experience, certifications, languages_taught, rating, review_count')
    .eq('id', id)
    .eq('role', 'teacher')
    .single()

  if (!profileRaw) notFound()
  const profile = profileRaw as Pick<Profile, 'id' | 'name' | 'bio' | 'avatar_url' | 'created_at' | 'intro_video_url' | 'years_experience' | 'certifications' | 'languages_taught' | 'rating' | 'review_count'>

  const tp = profile as unknown as Partial<TeacherProfile>

  // Reviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviewsRaw } = await (admin as any)
    .from('reviews')
    .select('*, profiles:student_id(name, avatar_url), courses(name, language)')
    .eq('teacher_id', id)
    .order('created_at', { ascending: false })
    .limit(10)
  const reviews = (reviewsRaw ?? []) as ReviewRow[]

  // Courses taught
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: coursesRaw } = await (admin as any)
    .from('course_teachers')
    .select('courses(id, name, language, level, thumbnail_url)')
    .eq('teacher_id', id)
  const courses = ((coursesRaw ?? []) as { courses: Pick<Course, 'id' | 'name' | 'language' | 'level'> | null }[])
    .map(c => c.courses).filter(Boolean) as Pick<Course, 'id' | 'name' | 'language' | 'level'>[]

  const joinYear = new Date(profile.created_at).getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#6c4ff5]">LangMaster</Link>
          <Link href="/student/courses" className="text-sm text-gray-500 hover:text-[#6c4ff5] transition-colors">
            Browse courses →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">

          {/* ── Left sidebar: teacher card ── */}
          <aside className="lg:sticky lg:top-24 self-start space-y-5">
            {/* Avatar + name */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-purple-200">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-400 mt-1">Teacher since {joinYear}</p>
              {(tp.rating ?? 0) > 0 && (
                <div className="flex flex-col items-center mt-3 gap-1">
                  <StarRating rating={tp.rating ?? 0} size="lg" />
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-900">{(tp.rating ?? 0).toFixed(1)}</span>
                    {' '}({tp.review_count ?? 0} review{(tp.review_count ?? 0) !== 1 ? 's' : ''})
                  </p>
                </div>
              )}
            </div>

            {/* Quick facts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick facts</p>
              {[
                { icon: '🎓', label: 'Experience', val: `${tp.years_experience ?? 0}+ years` },
                { icon: '📚', label: 'Courses',    val: `${courses.length} active` },
                { icon: '⭐', label: 'Reviews',    val: `${tp.review_count ?? 0} received` },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{f.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            {tp.languages_taught && tp.languages_taught.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Languages taught</p>
                <div className="space-y-2">
                  {tp.languages_taught.map(l => (
                    <div key={l.lang} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{l.lang}</span>
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {PROFICIENCY_LABELS[l.proficiency] ?? l.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Right main: bio + video + certs + courses + reviews ── */}
          <main className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><span>✍️</span> About me</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Intro video */}
            {tp.intro_video_url && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><span>🎥</span> Intro video</h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <iframe
                    src={tp.intro_video_url.replace('watch?v=', 'embed/')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Certifications */}
            {tp.certifications && tp.certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><span>🎓</span> Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {tp.certifications.map(c => (
                    <span key={c} className="text-sm font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span>📚</span> Courses I teach</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {courses.map(c => (
                    <Link key={c.id} href={`/student/courses/${c.id}`}
                      className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c4ff5]/10 to-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                        🌐
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-[#6c4ff5] transition-colors truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.language} · {c.level}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⭐</span> Student reviews
                {reviews.length > 0 && <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>}
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm text-gray-400">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">{r.profiles?.name ?? 'Student'}</p>
                            <StarRating rating={r.rating} />
                          </div>
                          {r.courses && (
                            <p className="text-xs text-gray-400 mb-1.5">{r.courses.name} · {r.courses.language}</p>
                          )}
                          {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                          <p className="text-xs text-gray-300 mt-1.5">
                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

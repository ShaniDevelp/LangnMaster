'use client'
import { useState, useEffect } from 'react'
import { getCourseDetails } from '@/lib/teacher/course-details'
import { courseLang } from '@/components/CourseBanner'
import type { Course, CourseModule } from '@/lib/supabase/types'

type Details = {
  course: Course
  modules: CourseModule[]
  teachersCount: number
  studentsCount: number
  otherTeachers: { id: string; name: string; avatar_url: string | null }[]
}

export function CourseDetailModal({ courseId, currentUserId, onClose }: { courseId: string; currentUserId: string; onClose: () => void }) {
  const [details, setDetails] = useState<Details | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourseDetails(courseId, currentUserId)
        setDetails(data as Details)
      } catch (err) {
        console.error('Failed to load course details', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, currentUserId])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero banner — image or language gradient, with title overlaid */}
        {details ? (
          (() => {
            const cfg = courseLang(details.course.language)
            return (
              <div className={`relative flex-shrink-0 min-h-[180px] flex flex-col justify-end overflow-hidden bg-gradient-to-br ${cfg.gradient}`}>
                {details.course.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={details.course.thumbnail_url} alt={details.course.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
                {/* Scrim so the white text stays readable over any image/gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="relative p-6 sm:p-8 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm uppercase tracking-wider">
                      {cfg.emoji} {details.course.language}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm uppercase tracking-wider capitalize">
                      {details.course.level}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{details.course.name}</h2>
                  <p className="text-sm text-white/80 mt-1">
                    Rs {Number(details.course.price_pkr).toLocaleString()} · one-time per course
                  </p>
                </div>
              </div>
            )
          })()
        ) : (
          <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-6 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Course details</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Loading course details…</p>
            </div>
          ) : details ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {details.course.description || "No description provided for this course."}
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    Curriculum
                  </h3>
                  <div className="space-y-3">
                    {details.modules.length > 0 ? (
                      details.modules.map(mod => (
                        <div key={mod.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-brand-100 transition-all group">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                              {mod.week_number}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{mod.title}</h4>
                              <p className="text-xs text-gray-400">Week {mod.week_number} • {mod.topics.length} topics</p>
                            </div>
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 ml-14">
                            {mod.topics.map((t, i) => (
                              <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-brand-300" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic bg-gray-50 p-6 rounded-2xl text-center border border-dashed">
                        Curriculum details are being finalized.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-emerald-600">{details.studentsCount}</p>
                      <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-tighter">Students</p>
                    </div>
                    <div className="bg-amber-50/50 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-amber-600">{details.teachersCount}</p>
                      <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-tighter">Teachers</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Other Teachers</h4>
                    {details.otherTeachers.length > 0 ? (
                      <div className="space-y-3">
                        {details.otherTeachers.map(t => (
                          <div key={t.id} className="flex items-center gap-3">
                            {t.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.avatar_url} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {t.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-700">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No other teachers yet.</p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        ⏱
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{details.course.duration_weeks} Weeks</p>
                        <p className="text-[10px] text-gray-400">Course Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        🎓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{details.course.sessions_per_week} Sessions/wk</p>
                        <p className="text-[10px] text-gray-400">Weekly Intensity</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-500 rounded-3xl p-6 text-white shadow-sm">
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-2">Max Group Size</p>
                  <p className="text-3xl font-extrabold mb-1">{details.course.max_group_size} Students</p>
                  <p className="text-[10px] opacity-70">Small groups for better learning results.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Course not found.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}

'use client'
import { useState, useTransition } from 'react'
import { requestToTeachCourse } from '@/lib/teacher/actions'
import { CourseDetailModal } from '@/components/CourseDetailModal'

type CourseWithStatus = {
  id: string
  name: string
  language: string
  level: string
  sessions_per_week: number
  duration_weeks: number
  status: 'none' | 'pending' | 'approved' | 'rejected'
}

export function AvailableCoursesClient({ courses, currentUserId }: { courses: CourseWithStatus[]; currentUserId: string }) {
  const [localCourses, setLocalCourses] = useState(courses)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  function handleRequest(courseId: string) {
    setError(null)
    startTransition(async () => {
      const result = await requestToTeachCourse(courseId)
      if (result && 'error' in result) {
        setError(result.error ?? 'Failed to submit request')
      } else {
        setLocalCourses(prev => prev.map(c =>
          c.id === courseId ? { ...c, status: 'pending' } : c
        ))
      }
    })
  }

  if (courses.length === 0) return null

  return (
    <div className="">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localCourses.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col group hover:shadow-md transition-all">
            <div className="flex-1 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-gray-100 text-gray-600 capitalize">
                  {c.language} · {c.level}
                </span>
                <div className="flex items-center gap-2">
                  {c.status === 'approved' && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">✓ Approved</span>
                  )}
                  {c.status === 'pending' && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">⏳ Pending</span>
                  )}
                  {c.status === 'rejected' && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Not approved</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 leading-tight mb-1">{c.name}</h3>
              <p className="text-xs text-gray-400">
                {c.sessions_per_week} sessions/week · {c.duration_weeks} weeks
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCourseId(c.id)}
                className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                View Info
              </button>
              
              {c.status === 'none' && (
                <button
                  onClick={() => handleRequest(c.id)}
                  disabled={isPending}
                  className="flex-[2] py-2.5 rounded-xl bg-brand-600 border border-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Requesting…' : 'Request to teach'}
                </button>
              )}
              {c.status === 'pending' && (
                <button disabled className="flex-[2] py-2.5 rounded-xl bg-amber-50 border border-transparent text-amber-600 font-semibold text-sm cursor-not-allowed">
                  Under review
                </button>
              )}
              {c.status === 'approved' && (
                <button disabled className="flex-[2] py-2.5 rounded-xl bg-emerald-50 border border-transparent text-emerald-600 font-semibold text-sm cursor-not-allowed">
                  You can teach this
                </button>
              )}
              {c.status === 'rejected' && (
                <button disabled className="flex-[2] py-2.5 rounded-xl bg-gray-50 border border-transparent text-gray-400 font-semibold text-sm cursor-not-allowed">
                  Request denied
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCourseId && (
        <CourseDetailModal 
          courseId={selectedCourseId} 
          currentUserId={currentUserId}
          onClose={() => setSelectedCourseId(null)} 
        />
      )}
    </div>
  )
}

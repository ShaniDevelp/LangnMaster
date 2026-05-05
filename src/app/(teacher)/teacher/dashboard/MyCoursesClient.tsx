'use client'
import { useState } from 'react'
import Link from 'next/link'
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

export function MyCoursesClient({ courses, currentUserId }: { courses: CourseWithStatus[]; currentUserId: string }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  if (courses.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-3xl mb-3">🎓</p>
        <p className="font-semibold text-gray-700">No teaching subjects yet</p>
        <p className="text-sm text-gray-400 mt-1 mb-4">Request to teach courses from our catalog to get started.</p>
        <Link href="/teacher/courses" className="inline-block bg-brand-50 text-brand-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-brand-100 transition-colors">
          Browse Course Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Teaching Subjects</h2>
        <Link href="/teacher/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Browse more courses →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col group hover:shadow-md transition-all">
            <div className="flex-1 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-gray-100 text-gray-600 capitalize">
                  {c.language} · {c.level}
                </span>
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
              <h3 className="font-bold text-gray-900 leading-tight mb-1">{c.name}</h3>
              <p className="text-xs text-gray-400">
                {c.sessions_per_week} sessions/week · {c.duration_weeks} weeks
              </p>
            </div>
            <button 
              onClick={() => setSelectedCourseId(c.id)}
              className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors mt-2"
            >
              View Detailed Info
            </button>
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

'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CourseWithStats } from './page'
import { CourseForm } from './CourseForm'
import { createCourse } from '@/lib/admin/course-actions'

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
}

export function CoursesClient({ courses }: { courses: CourseWithStats[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter(c => {
      if (statusFilter === 'active' && !c.is_active) return false
      if (statusFilter === 'inactive' && c.is_active) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.language.toLowerCase().includes(q)
    })
  }, [courses, query, statusFilter])

  const activeCount = courses.filter(c => c.is_active).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} total · {activeCount} active</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold text-sm rounded-xl transition-colors active:scale-95"
        >
          + Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or language…"
          className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5]"
        />
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-500 text-sm">
            {courses.length === 0 ? 'No courses yet. Add your first course.' : 'No courses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className="relative h-32 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                {course.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🎓</span>
                )}
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500">{course.language}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-600'}`}>
                    {course.level}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 truncate group-hover:text-[#6c4ff5] transition-colors">{course.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-3 leading-relaxed">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Rs {Number(course.price_pkr).toLocaleString()}</span>
                  <span>{course.enrollmentCount} enrolled · {course.groupCount} groups</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">New Course</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">✕</button>
            </div>
            <div className="p-6">
              <CourseForm
                submitLabel="Create Course"
                onSubmit={createCourse}
                onSuccess={() => { setShowAdd(false); router.refresh() }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

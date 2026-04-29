import { createClient } from '@/lib/supabase/server'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'
import { AssignGroupsButton } from '@/components/admin/AssignGroupsButton'

type EnrollmentRow = Enrollment & {
  profiles: Pick<Profile, 'id' | 'name'> | null
  courses: Pick<Course, 'name' | 'language' | 'level' | 'max_group_size'> | null
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient()

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, profiles:user_id(id, name), courses(name, language, level, max_group_size)')
    .order('enrolled_at', { ascending: false })

  const enrollments = (enrollmentsRaw ?? []) as unknown as EnrollmentRow[]
  const pending = enrollments.filter(e => e.status === 'pending')

  // Group pending by course to preview batches
  const pendingByCourse = pending.reduce<Record<string, EnrollmentRow[]>>((acc, e) => {
    const key = e.course_id
    acc[key] = acc[key] ?? []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 text-sm mt-1">{enrollments.length} total · {pending.length} pending</p>
        </div>
      </div>

      {/* Batch assign panel */}
      {pending.length > 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-purple-900 text-lg">Ready to assign groups</h2>
              <p className="text-purple-700 text-sm mt-1">
                {pending.length} student{pending.length !== 1 ? 's' : ''} waiting · will be grouped into {Math.ceil(pending.length / 2)} group{Math.ceil(pending.length / 2) !== 1 ? 's' : ''} of max 2
              </p>
            </div>
            <AssignGroupsButton />
          </div>

          {/* Preview batches per course */}
          <div className="mt-5 space-y-3">
            {Object.entries(pendingByCourse).map(([courseId, rows]) => {
              const course = rows[0].courses
              const groupCount = Math.ceil(rows.length / (course?.max_group_size ?? 2))
              return (
                <div key={courseId} className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course?.name}</p>
                      <p className="text-xs text-gray-400">{course?.language} · {course?.level}</p>
                    </div>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                      → {groupCount} group{groupCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rows.map(e => (
                      <div key={e.id} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {e.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span className="text-xs text-gray-700">{e.profiles?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-green-700 font-semibold">✓ All enrollments assigned</p>
          <p className="text-green-600 text-sm mt-1">No pending enrollments right now.</p>
        </div>
      )}

      {/* Full enrollment table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Enrollments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {e.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-gray-900">{e.profiles?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{e.courses?.name}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No enrollments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import type { Profile, Enrollment } from '@/lib/supabase/types'

type StudentRow = Profile & {
  enrollments: (Pick<Enrollment, 'id' | 'status'> & { courses: { name: string } | null })[]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select('*, enrollments(id, status, courses(name))')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  const students = (studentsRaw ?? []) as unknown as StudentRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} registered</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled Courses</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No students yet</td>
                </tr>
              ) : students.map(s => {
                const activeEnrollment = s.enrollments.find(e => e.status === 'active' || e.status === 'assigned')
                const pendingCount = s.enrollments.filter(e => e.status === 'pending').length
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.enrollments.length === 0 ? (
                        <span className="text-gray-400 text-xs">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.enrollments.slice(0, 2).map(e => (
                            <span key={e.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {e.courses?.name}
                            </span>
                          ))}
                          {s.enrollments.length > 2 && (
                            <span className="text-xs text-gray-400">+{s.enrollments.length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {activeEnrollment ? (
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Active</span>
                      ) : pendingCount > 0 ? (
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                          {pendingCount} pending
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">No enrollment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(s.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

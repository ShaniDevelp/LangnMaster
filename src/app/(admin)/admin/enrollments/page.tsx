import { createClient } from '@/lib/supabase/server'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'
import { GroupBuilder } from './GroupBuilder'

type EnrollmentRow = Enrollment & {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
  courses: Pick<Course, 'id' | 'name' | 'language' | 'level' | 'max_group_size' | 'sessions_per_week' | 'duration_weeks'> | null
}

type TeacherData = {
  id: string
  name: string
  avatar_url: string | null
  availability: string[]
  languages_taught: { lang: string; proficiency: string }[]
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

  // 1. Fetch Enrollments
  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, profiles:user_id(id, name, avatar_url, availability), courses(id, name, language, level, max_group_size, sessions_per_week, duration_weeks)')
    .order('enrolled_at', { ascending: false })

  const enrollments = (enrollmentsRaw ?? []) as unknown as EnrollmentRow[]
  const pending = enrollments.filter(e => e.status === 'pending')

  // 2. Fetch Teachers for the Group Builder
  const { data: teachersRaw } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, availability, languages_taught')
    .eq('role', 'teacher')

  const teachers: TeacherData[] = ((teachersRaw ?? []) as { id: string; name: string; avatar_url: string | null; availability: string[] | null; languages_taught: { lang: string; proficiency: string }[] | null }[]).map(t => ({
    id: t.id,
    name: t.name,
    avatar_url: t.avatar_url,
    availability: t.availability ?? [],
    languages_taught: t.languages_taught ?? []
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments & Group Builder</h1>
          <p className="text-gray-500 text-sm mt-1">{enrollments.length} total · {pending.length} pending assignment</p>
        </div>
      </div>

      {/* The new Interactive Group Builder */}
      <GroupBuilder pending={pending} teachers={teachers} />

      {/* Full enrollment table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
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

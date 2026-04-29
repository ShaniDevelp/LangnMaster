import { createClient } from '@/lib/supabase/server'
import type { Profile, Group } from '@/lib/supabase/types'

type TeacherRow = Profile & {
  groups: (Pick<Group, 'id' | 'status'> & { courses: { name: string } | null })[]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export default async function AdminTeachersPage() {
  const supabase = await createClient()

  const { data: teachersRaw } = await supabase
    .from('profiles')
    .select('*, groups:groups(id, status, courses(name))')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  const teachers = (teachersRaw ?? []) as unknown as TeacherRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <p className="text-gray-500 text-sm mt-1">{teachers.length} registered</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teacher</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Groups</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Groups</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No teachers yet</td>
                </tr>
              ) : teachers.map(t => {
                const activeGroups = t.groups.filter(g => g.status === 'active')
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          {t.bio && <p className="text-xs text-gray-400 max-w-xs truncate">{t.bio}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {activeGroups.length === 0 ? (
                          <span className="text-xs text-gray-400">None</span>
                        ) : activeGroups.slice(0, 2).map(g => (
                          <span key={g.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            {g.courses?.name}
                          </span>
                        ))}
                        {activeGroups.length > 2 && (
                          <span className="text-xs text-gray-400">+{activeGroups.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        t.groups.length > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {t.groups.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(t.created_at)}</td>
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

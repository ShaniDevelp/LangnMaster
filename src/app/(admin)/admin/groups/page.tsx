import { createClient } from '@/lib/supabase/server'
import type { Profile, Group, Course, GroupMember, Session } from '@/lib/supabase/types'

type GroupRow = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week'> | null
  profiles: Pick<Profile, 'name'> | null
  group_members: (GroupMember & { profiles: Pick<Profile, 'name'> | null })[]
}
type SessionCount = { group_id: string; count: number }

export default async function AdminGroupsPage() {
  const supabase = await createClient()

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('*, courses(name, language, level, sessions_per_week), profiles:teacher_id(name), group_members(*, profiles:user_id(name))')
    .order('created_at', { ascending: false })

  const groups = (groupsRaw ?? []) as unknown as GroupRow[]

  // Get session counts per group
  let sessionCounts: Record<string, number> = {}
  if (groups.length > 0) {
    const { data: sessRaw } = await supabase
      .from('sessions')
      .select('group_id')
      .in('group_id', groups.map(g => g.id))

    sessionCounts = ((sessRaw ?? []) as { group_id: string }[]).reduce<Record<string, number>>((acc, s) => {
      acc[s.group_id] = (acc[s.group_id] ?? 0) + 1
      return acc
    }, {})
  }

  const activeCount = groups.filter(g => g.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-500 text-sm mt-1">{groups.length} total · {activeCount} active</p>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-200 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold text-gray-700">No groups yet</p>
          <p className="text-sm text-gray-400 mt-1">Assign groups from the Enrollments page.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">{g.courses?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {g.courses?.language} · {g.courses?.level} · {g.courses?.sessions_per_week}x/week
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {g.status}
              </span>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Teacher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase w-14">Teacher</span>
                {g.profiles?.name ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {g.profiles.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{g.profiles.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-amber-600 font-medium">Unassigned</span>
                )}
              </div>

              {/* Students */}
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase w-14 pt-0.5">Students</span>
                <div className="flex flex-wrap gap-1.5">
                  {g.group_members.length === 0 ? (
                    <span className="text-sm text-gray-400">None</span>
                  ) : g.group_members.map(m => (
                    <div key={m.id} className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-2 py-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className="text-xs text-gray-700">{m.profiles?.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions + week start */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>📅 {sessionCounts[g.id] ?? 0} sessions</span>
                  <span>🗓 Starts {new Date(g.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

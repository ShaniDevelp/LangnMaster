import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Profile, Session, Group, Course, GroupMember } from '@/lib/supabase/types'

type GroupRow = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
  group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null })[]
}
type SessionSlim = Pick<Session, 'group_id' | 'scheduled_at' | 'status' | 'room_token'>

export default async function TeacherGroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('*, courses(name, language, level, sessions_per_week, duration_weeks), group_members(*, profiles:user_id(id, name, avatar_url))')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const groups = (groupsRaw ?? []) as unknown as GroupRow[]

  let nextByGroup: Record<string, SessionSlim> = {}
  if (groups.length > 0) {
    const { data: sessionsRaw } = await supabase
      .from('sessions')
      .select('group_id, scheduled_at, status, room_token')
      .in('group_id', groups.map(g => g.id))
      .in('status', ['scheduled', 'active'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    const sessions = (sessionsRaw ?? []) as unknown as SessionSlim[]
    nextByGroup = sessions.reduce<Record<string, SessionSlim>>((acc, s) => {
      if (!acc[s.group_id]) acc[s.group_id] = s
      return acc
    }, {})
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
        <p className="text-gray-500 text-sm mt-1">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
      </div>

      {groups.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold text-gray-700">No groups assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">The admin will assign student groups to you each week.</p>
        </div>
      )}

      <div className="space-y-4">
        {groups.map(group => {
          const next = nextByGroup[group.id]
          return (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{group.courses?.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {group.courses?.language} · {group.courses?.level} · {group.courses?.sessions_per_week}x/week
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-white text-purple-600 border border-purple-200 px-2.5 py-1 rounded-full">
                    {group.status}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Students</p>
                <div className="space-y-2">
                  {group.group_members.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.profiles?.name}</p>
                        <p className="text-xs text-gray-400">Student</p>
                      </div>
                    </div>
                  ))}
                  {group.group_members.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No students assigned yet</p>
                  )}
                </div>
              </div>

              {next ? (
                <div className="px-5 pb-4">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Next session</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {new Date(next.scheduled_at).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit', hour12: true,
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/teacher/session/${next.room_token}`}
                      className="text-xs font-bold bg-[#6c4ff5] text-white px-4 py-2 rounded-xl hover:bg-[#5c3de8] transition-colors"
                    >
                      {next.status === 'active' ? 'Resume' : 'Start'}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-4">
                  <p className="text-xs text-gray-400 italic">No upcoming sessions</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

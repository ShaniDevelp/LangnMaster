import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Profile, Session, Group, Course, GroupMember } from '@/lib/supabase/types'

type SessionRow = Session & {
  groups: (Group & { courses: Pick<Course, 'name' | 'language'> | null }) | null
}
type GroupRow = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
  group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null })[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('*, courses(name, language, level, sessions_per_week, duration_weeks), group_members(*, profiles:user_id(id, name, avatar_url))')
    .eq('teacher_id', user.id)
    .eq('status', 'active')

  const groups = (groupsRaw ?? []) as unknown as GroupRow[]
  const groupIds = groups.map(g => g.id)

  let upcomingSessions: SessionRow[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('*, groups(*, courses(name, language))')
      .in('group_id', groupIds)
      .in('status', ['scheduled', 'active'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)
    upcomingSessions = (data ?? []) as unknown as SessionRow[]
  }

  const totalStudents = groups.reduce((acc, g) => acc + g.group_members.length, 0)
  const nextSession = upcomingSessions[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hey, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active groups', value: String(groups.length) },
          { label: 'Students', value: String(totalStudents) },
          { label: 'Today', value: String(upcomingSessions.filter(s => new Date(s.scheduled_at).toDateString() === new Date().toDateString()).length) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {nextSession ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-lg shadow-emerald-100">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Next Class</p>
          <h2 className="text-xl font-bold mb-1">{nextSession.groups?.courses?.name}</h2>
          <p className="text-emerald-100 text-sm mb-4">{formatTime(nextSession.scheduled_at)}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">{nextSession.status}</span>
            <Link
              href={`/teacher/session/${nextSession.room_token}`}
              className="bg-white text-emerald-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              {nextSession.status === 'active' ? 'Resume Class' : 'Start Class'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
          <p className="text-gray-400 text-sm">No upcoming sessions</p>
          {groups.length === 0 && <p className="text-xs text-gray-400 mt-1">You will be assigned groups by the admin</p>}
        </div>
      )}

      {upcomingSessions.length > 1 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">More Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.slice(1).map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{s.groups?.courses?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(s.scheduled_at)}</p>
                </div>
                <Link href={`/teacher/session/${s.room_token}`} className="text-xs font-bold text-[#6c4ff5]">Open →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">My Groups</h2>
            <Link href="/teacher/groups" className="text-sm text-[#6c4ff5] font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {groups.slice(0, 3).map(g => (
              <div key={g.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{g.courses?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.group_members.length} students</p>
                  </div>
                  <div className="flex -space-x-2">
                    {g.group_members.slice(0, 3).map(m => (
                      <div key={m.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

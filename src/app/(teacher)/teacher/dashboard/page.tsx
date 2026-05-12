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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}
function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString()
}

import { MyCoursesClient } from './MyCoursesClient'

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
    .neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')

  const groups = (groupsRaw ?? []) as unknown as GroupRow[]
  const groupIds = groups.map(g => g.id)

  let upcoming: SessionRow[] = []
  let recentCompleted: SessionRow[] = []

  if (groupIds.length > 0) {
    const { data: upRaw } = await supabase
      .from('sessions')
      .select('*, groups(*, courses(name, language))')
      .in('group_id', groupIds)
      .in('status', ['scheduled', 'active'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(6)
    upcoming = (upRaw ?? []) as unknown as SessionRow[]

    const { data: doneRaw } = await supabase
      .from('sessions')
      .select('*, groups(*, courses(name, language))')
      .in('group_id', groupIds)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(3)
    recentCompleted = (doneRaw ?? []) as unknown as SessionRow[]
  }

  const totalStudents = groups.reduce((acc, g) => acc + g.group_members.length, 0)
  const todayCount = upcoming.filter(s => isToday(s.scheduled_at)).length
  const nextSession = upcoming[0]

  // Fetch available courses and the teacher's current request status
  const { data: coursesRaw } = await supabase
    .from('courses')
    .select('*, course_teachers(teacher_id, status)')
    .eq('is_active', true)
    .eq('course_teachers.teacher_id', user.id)

  const availableCourses = (coursesRaw ?? []).map(c => ({
    id: c.id,
    name: c.name,
    language: c.language,
    level: c.level,
    sessions_per_week: c.sessions_per_week,
    duration_weeks: c.duration_weeks,
    status: (c.course_teachers as any)?.[0]?.status ?? 'none'
  })) as any[]

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
            Welcome back, {profile?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/groups"
            className="self-start sm:self-auto text-sm font-semibold text-[#6c4ff5] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors">
            My Groups
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Groups', value: String(groups.length), icon: '👥', color: 'from-purple-500 to-indigo-500' },
          { label: 'Total Students', value: String(totalStudents), icon: '🎓', color: 'from-blue-500 to-cyan-500' },
          { label: 'Sessions Today', value: String(todayCount), icon: '📅', color: 'from-emerald-500 to-teal-500', link: '/teacher/sessions' },
          { label: 'Upcoming', value: String(upcoming.length), icon: '⏰', color: 'from-amber-500 to-orange-500', link: '/teacher/sessions' },
        ].map(s => (
          <div key={s.label} className="relative group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            {s.link && (
               <Link href={s.link} className="absolute inset-0 z-10" />
            )}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Next session banner (spans 3 cols) ── */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-base font-bold text-gray-900">Next Session</h2>
          {nextSession ? (
            <div className="bg-gradient-to-br from-[#6c4ff5] to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isToday(nextSession.scheduled_at) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Today
                    </span>
                  )}
                  <h3 className="text-xl font-bold truncate">{nextSession.groups?.courses?.name}</h3>
                  <p className="text-purple-200 text-sm mt-1">{formatDate(nextSession.scheduled_at)}</p>
                  <p className="text-purple-300 text-xs mt-0.5 capitalize">{nextSession.groups?.courses?.language}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${nextSession.status === 'active' ? 'bg-emerald-400 text-white' : 'bg-white/20 text-white'
                    }`}>
                    {nextSession.status}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={`/teacher/session/${nextSession.room_token}`}
                  className="bg-white text-[#6c4ff5] font-bold text-sm px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
                >
                  {nextSession.status === 'active' ? '▶ Resume Class' : '▶ Enter Lobby'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-3xl mb-3">🗓</p>
              <p className="font-semibold text-gray-700">No upcoming sessions</p>
              <p className="text-sm text-gray-400 mt-1">
                {groups.length === 0 ? 'Admin will assign groups and schedule sessions.' : 'You\'re all caught up!'}
              </p>
            </div>
          )}

          {/* More upcoming sessions */}
          {upcoming.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-700">More sessions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.slice(1).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isToday(s.scheduled_at) ? 'bg-emerald-400' : 'bg-gray-200'
                        }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.groups?.courses?.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(s.scheduled_at)}</p>
                      </div>
                    </div>
                    <Link href={`/teacher/session/${s.room_token}`}
                      className="text-xs font-bold text-[#6c4ff5] hover:underline flex-shrink-0">
                      Open →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <Link href="/teacher/sessions" className="text-sm font-bold text-gray-400 hover:text-[#6c4ff5] transition-all flex items-center justify-center gap-2 group">
              View your full schedule and history
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* ── Right: groups + recent ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* My groups */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">My Groups</h2>
              <Link href="/teacher/groups" className="text-xs text-[#6c4ff5] font-semibold hover:underline">
                See all
              </Link>
            </div>
            {groups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-400">No groups yet — admin will assign them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 4).map(g => (
                  <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c4ff5]/10 to-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{g.courses?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {g.group_members.length} student{g.group_members.length !== 1 ? 's' : ''} · {g.courses?.level}
                      </p>
                    </div>
                    <div className="flex -space-x-2 flex-shrink-0">
                      {g.group_members.slice(0, 2).map(m => (
                        <div key={m.id}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                          {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent completed */}
          {recentCompleted.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Recent Sessions</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentCompleted.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{s.groups?.courses?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.scheduled_at)}</p>
                      </div>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── My Course Requests (refactored to client component) ── */}
      <MyCoursesClient courses={availableCourses.filter(c => c.status !== 'none')} currentUserId={user.id} />
    </div>
  )
}

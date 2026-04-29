import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Course, Enrollment, Session, Group, Profile } from '@/lib/supabase/types'

type EnrollmentRow = Enrollment & { courses: Course | null }
type SessionRow = Session & {
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    profiles: Pick<Profile, 'name'> | null
  }) | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return 'Started'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `in ${Math.floor(h / 24)}d`
  if (h > 0) return `in ${h}h ${m}m`
  return `in ${m}m`
}

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null

  const { data: memberGroupsRaw } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const memberGroups = (memberGroupsRaw ?? []) as { group_id: string }[]
  const groupIds = memberGroups.map(m => m.group_id)

  let upcomingSessions: SessionRow[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('*, groups(*, courses(name, language), profiles:teacher_id(name))')
      .in('group_id', groupIds)
      .in('status', ['scheduled', 'active'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)
    upcomingSessions = (data ?? []) as unknown as SessionRow[]
  }

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  const enrollments = (enrollmentsRaw ?? []) as unknown as EnrollmentRow[]

  const isAssigned = groupIds.length > 0
  const hasPending = enrollments.some(e => e.status === 'pending')
  const nextSession = upcomingSessions[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hey, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {nextSession ? (
        <div className="bg-gradient-to-br from-[#6c4ff5] to-indigo-600 text-white rounded-3xl p-6 shadow-lg shadow-purple-200">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">Next Session</p>
          <h2 className="text-xl font-bold mb-1">{nextSession.groups?.courses?.name}</h2>
          <p className="text-purple-200 text-sm mb-4">{formatTime(nextSession.scheduled_at)}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">⏰ {timeUntil(nextSession.scheduled_at)}</span>
            <Link
              href={`/student/session/${nextSession.room_token}`}
              className="bg-white text-[#6c4ff5] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              {nextSession.status === 'active' ? 'Join Now' : 'Join Room'}
            </Link>
          </div>
        </div>
      ) : hasPending ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <p className="text-amber-800 font-semibold text-sm">⏳ Enrollment pending</p>
          <p className="text-amber-600 text-sm mt-1">You will be assigned to a group this Monday. Sessions start next week.</p>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 text-center">
          <p className="text-purple-700 font-semibold mb-2">No sessions yet</p>
          <Link href="/student/courses" className="text-sm font-semibold text-[#6c4ff5]">Browse courses →</Link>
        </div>
      )}

      {isAssigned && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions done', value: '0' },
            { label: 'Streak', value: '0🔥' },
            { label: 'Upcoming', value: String(upcomingSessions.length) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">My Courses</h2>
          <Link href="/student/courses" className="text-sm text-[#6c4ff5] font-medium">Browse all</Link>
        </div>
        {enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map(e => (
              <div key={e.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-2xl flex-shrink-0">
                  {e.courses?.language === 'English' ? '🇬🇧' : e.courses?.language === 'Spanish' ? '🇪🇸' : '🇫🇷'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{e.courses?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.courses?.sessions_per_week}x/week · {e.courses?.duration_weeks} weeks
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  e.status === 'active' ? 'bg-green-100 text-green-700' :
                  e.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 text-sm">No enrollments yet</p>
            <Link href="/student/courses" className="mt-2 inline-block text-sm font-semibold text-[#6c4ff5]">
              Explore courses →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type SessionRow = Session & {
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    profiles: Pick<Profile, 'name' | 'avatar_url'> | null
  }) | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const statusColor: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

export default async function StudentSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberGroupsRaw } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = ((memberGroupsRaw ?? []) as { group_id: string }[]).map(m => m.group_id)

  let sessions: SessionRow[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('*, groups(*, courses(name, language), profiles:teacher_id(name, avatar_url))')
      .in('group_id', groupIds)
      .order('scheduled_at', { ascending: false })
    sessions = (data ?? []) as unknown as SessionRow[]
  }

  const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'active')
  const past = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">Your scheduled and past sessions</p>
      </div>

      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold text-gray-700">No sessions yet</p>
          <p className="text-sm text-gray-400 mt-1">Enroll in a course to get scheduled sessions.</p>
          <Link href="/student/courses" className="mt-4 inline-block text-sm font-semibold text-[#6c4ff5]">
            Browse courses →
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{s.groups?.courses?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Teacher: {s.groups?.profiles?.name ?? 'TBD'}</p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">{formatDate(s.scheduled_at)} · {formatTime(s.scheduled_at)}</p>
                    <p className="text-xs text-gray-400">{s.duration_minutes} min</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[s.status]}`}>{s.status}</span>
                    <Link
                      href={`/student/session/${s.room_token}`}
                      className="text-xs font-bold bg-[#6c4ff5] text-white px-3 py-1.5 rounded-xl hover:bg-[#5c3de8] transition-colors"
                    >
                      Join →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-3">Past Sessions</h2>
          <div className="space-y-3">
            {past.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.groups?.courses?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.scheduled_at)} · {formatTime(s.scheduled_at)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[s.status]}`}>{s.status}</span>
                </div>
                {s.notes && <p className="text-xs text-gray-500 mt-2 italic">{s.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Profile, Group, Course, Session } from '@/lib/supabase/types'

type SessionRow = Session & {
  topic: string | null
  session_notes: string | null
  homework_text: string | null
  groups: (Group & { courses: Pick<Course, 'name' | 'language' | 'level'> | null }) | null
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-50 text-red-400',
  active:    'bg-purple-100 text-purple-700',
  scheduled: 'bg-gray-100 text-gray-500',
}

export default async function SessionHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('id')
    .eq('teacher_id', user.id)
  const groupIds = ((groupsRaw ?? []) as { id: string }[]).map(g => g.id)

  let sessions: SessionRow[] = []
  if (groupIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('sessions')
      .select('*, groups(*, courses(name, language, level))')
      .in('group_id', groupIds)
      .in('status', ['completed', 'cancelled'])
      .order('scheduled_at', { ascending: false })
      .limit(100)
    sessions = (data ?? []) as SessionRow[]
  }

  const totalDone = sessions.filter(s => s.status === 'completed').length
  const totalHours = sessions.filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + (s.duration_minutes / 60), 0)
  const notesWritten = sessions.filter(s => s.session_notes).length
  const homeworkSent = sessions.filter(s => s.homework_text).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Session History</h1>
        <p className="text-sm text-gray-400 mt-1">All completed and cancelled sessions — {profile?.name}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total sessions', value: String(totalDone),           icon: '🎥', color: 'from-purple-500 to-indigo-500' },
          { label: 'Hours taught',   value: totalHours.toFixed(1) + 'h', icon: '⏱', color: 'from-blue-500 to-cyan-500' },
          { label: 'Notes written',  value: `${notesWritten}/${totalDone}`, icon: '📝', color: 'from-emerald-500 to-teal-500' },
          { label: 'Homework set',   value: `${homeworkSent}/${totalDone}`, icon: '📚', color: 'from-amber-500 to-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Session list ── */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-bold text-gray-700">No completed sessions yet</p>
          <p className="text-sm text-gray-400 mt-2">Sessions will appear here after they&apos;re marked complete.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">
              All sessions <span className="text-gray-400 font-normal">({sessions.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {sessions.map(s => (
              <div key={s.id} id={s.id} className="px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                      🎥
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{s.groups?.courses?.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>
                          {s.status}
                        </span>
                        <Link href="/teacher/groups" className="text-xs text-gray-400 hover:text-[#6c4ff5] transition-colors">
                          View group →
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500">{fmt(s.scheduled_at)}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{s.duration_minutes} min</span>
                        <span>{s.groups?.courses?.language}</span>
                        <span className="capitalize">{s.groups?.courses?.level}</span>
                      </div>
                      {s.topic && (
                        <p className="text-xs text-[#6c4ff5] font-medium mt-1.5">📌 {s.topic}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.session_notes ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {s.session_notes ? '📝 Notes' : '📝 No notes'}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.homework_text ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {s.homework_text ? '📚 Homework' : '📚 No homework'}
                    </span>
                  </div>
                </div>

                {(s.session_notes || s.homework_text) && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {s.session_notes && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Session notes</p>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{s.session_notes}</p>
                      </div>
                    )}
                    {s.homework_text && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Homework</p>
                        <p className="text-sm text-purple-700 leading-relaxed line-clamp-3">{s.homework_text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

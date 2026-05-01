import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import type { Profile, Group, Course, GroupMember, Session } from '@/lib/supabase/types'

type SessionRow = Session & {
  topic?: string | null
  session_notes?: string | null
  homework_text?: string | null
  homework_url?: string | null
}

type GroupRow = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
  group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null })[]
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced:     'bg-purple-50 text-purple-700',
}

const ATTENDANCE_BADGE: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  late:    'bg-amber-100 text-amber-700',
  no_show: 'bg-red-50 text-red-500',
}

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: groupRaw } = await supabase
    .from('groups')
    .select('*, courses(name, language, level, sessions_per_week, duration_weeks), group_members(*, profiles:user_id(id, name, avatar_url))')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single()

  if (!groupRaw) notFound()
  const group = groupRaw as unknown as GroupRow

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessionsRaw } = await (supabase as any)
    .from('sessions')
    .select('*')
    .eq('group_id', id)
    .order('scheduled_at', { ascending: false })

  const sessions = (sessionsRaw ?? []) as SessionRow[]

  const sessionIds = sessions.map(s => s.id)
  let attendanceBySession: Record<string, { student_id: string; status: string }[]> = {}
  if (sessionIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attRaw } = await (supabase as any)
      .from('session_attendance')
      .select('session_id, student_id, status')
      .in('session_id', sessionIds)
    attendanceBySession = ((attRaw ?? []) as { session_id: string; student_id: string; status: string }[])
      .reduce<Record<string, { student_id: string; status: string }[]>>((acc, a) => {
        if (!acc[a.session_id]) acc[a.session_id] = []
        acc[a.session_id].push({ student_id: a.student_id, status: a.status })
        return acc
      }, {})
  }

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const upcoming = sessions.filter(s => ['scheduled', 'active'].includes(s.status))
  const levelStyle = LEVEL_COLORS[group.courses?.level ?? ''] ?? 'bg-gray-100 text-gray-600'

  const studentStats = group.group_members.map(m => {
    const total = completedSessions.length
    const present = completedSessions.filter(s => {
      const att = attendanceBySession[s.id] ?? []
      return att.some(a => a.student_id === m.profiles?.id && a.status === 'present')
    }).length
    const rate = total > 0 ? Math.round((present / total) * 100) : null
    return { ...m, present, total, rate }
  })

  return (
    <div className="space-y-6">
      <Link href="/teacher/groups" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#6c4ff5] transition-colors">
        ← Back to groups
      </Link>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#6c4ff5] to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">📚</div>
            <div>
              <h1 className="text-xl font-bold">{group.courses?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">{group.courses?.language}</span>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full capitalize">{group.courses?.level}</span>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">{group.courses?.sessions_per_week}×/week</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 text-center flex-shrink-0">
            {[
              { label: 'Students', val: group.group_members.length },
              { label: 'Done',     val: completedSessions.length },
              { label: 'Upcoming', val: upcoming.length },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5">
                <p className="text-xl font-bold">{s.val}</p>
                <p className="text-xs text-purple-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: students + upcoming ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
              <span className="text-lg">👥</span>
              <h2 className="font-bold text-gray-900 text-sm">Students</h2>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${levelStyle}`}>
                {group.courses?.level}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {group.group_members.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No students assigned</p>
              ) : studentStats.map(m => (
                <div key={m.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.profiles?.name}</p>
                      {m.rate !== null ? (
                        <p className="text-xs text-gray-400">
                          {m.present}/{m.total} sessions ·{' '}
                          <span className={m.rate >= 75 ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                            {m.rate}% attendance
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">No sessions yet</p>
                      )}
                    </div>
                  </div>
                  {m.rate !== null && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.rate >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${m.rate}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {upcoming.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <span className="text-lg">⏰</span>
                <h2 className="font-bold text-gray-900 text-sm">Upcoming ({upcoming.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.map(s => (
                  <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{fmt(s.scheduled_at)}</p>
                      {s.topic && <p className="text-xs text-gray-400 italic mt-0.5">{s.topic}</p>}
                    </div>
                    <Link href={`/teacher/session/${s.room_token}`}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex-shrink-0 ${
                        s.status === 'active'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-[#6c4ff5] text-white hover:bg-[#5c3de8]'
                      }`}>
                      {s.status === 'active' ? 'Resume' : 'Lobby →'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right 2 cols: session history ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">
                Session history{' '}
                <span className="text-gray-400 font-normal text-sm">({completedSessions.length} completed)</span>
              </h2>
            </div>

            {completedSessions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-sm font-semibold text-gray-700">No completed sessions yet</p>
                <p className="text-xs text-gray-400 mt-1">Sessions will appear here after they&apos;re completed.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {completedSessions.map(s => {
                  const att = attendanceBySession[s.id] ?? []
                  const presentCount = att.filter(a => a.status === 'present').length

                  return (
                    <div key={s.id} id={s.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">{fmt(s.scheduled_at)}</p>
                          {s.topic && <p className="text-sm text-[#6c4ff5] font-medium mt-0.5">📌 {s.topic}</p>}
                        </div>
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex-shrink-0">
                          {presentCount}/{group.group_members.length} attended
                        </span>
                      </div>

                      {att.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {group.group_members.map(m => {
                            const a = att.find(x => x.student_id === m.profiles?.id)
                            const status = a?.status ?? 'no_show'
                            return (
                              <span key={m.id} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ATTENDANCE_BADGE[status] ?? ATTENDANCE_BADGE.no_show}`}>
                                {m.profiles?.name?.split(' ')[0]} · {status.replace('_', ' ')}
                              </span>
                            )
                          })}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-3">
                        {s.session_notes && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{s.session_notes}</p>
                          </div>
                        )}
                        {s.homework_text && (
                          <div className="bg-purple-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Homework</p>
                            <p className="text-sm text-purple-700 leading-relaxed">{s.homework_text}</p>
                            {s.homework_url && (
                              <a href={s.homework_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-[#6c4ff5] font-semibold hover:underline mt-1 block">
                                Resource link →
                              </a>
                            )}
                          </div>
                        )}
                        {!s.session_notes && !s.homework_text && (
                          <p className="text-xs text-gray-400 italic sm:col-span-2">No notes or homework recorded.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type SessionRow = Session & {
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    profiles: Pick<Profile, 'name'> | null
  }) | null
}

const LANG_EMOJI: Record<string, string> = {
  English: '🇬🇧', Spanish: '🇪🇸', French: '🇫🇷',
  German: '🇩🇪', Mandarin: '🇨🇳', Japanese: '🇯🇵',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function timeUntil(iso: string, nowMs: number) {
  const diff = new Date(iso).getTime() - nowMs
  if (diff < 0) return 'Started'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 48) return `${Math.floor(h / 24)} days away`
  if (h > 0)  return `${h}h ${m}m away`
  return `${m}m away`
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
      .select('*, groups(*, courses(name, language), profiles:teacher_id(name))')
      .in('group_id', groupIds)
      .order('scheduled_at', { ascending: false })
    sessions = (data ?? []) as unknown as SessionRow[]
  }

  const nowMs = new Date().getTime()
  const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'active')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const past = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">
          {upcoming.length} upcoming · {past.length} completed
        </p>
      </div>

      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-dashed border-gray-200 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold text-gray-700">No sessions yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Enroll in a course to get scheduled sessions.</p>
          <Link href="/student/courses" className="inline-flex bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors">
            Browse courses →
          </Link>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((s, i) => {
              const lang = s.groups?.courses?.language ?? ''
              const isActive = s.status === 'active'
              const msUntil = new Date(s.scheduled_at).getTime() - nowMs
              const joinable = isActive || msUntil < 10 * 60_000
              const isNext = i === 0
              return (
                <div key={s.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isNext ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isNext ? 'bg-brand-50' : 'bg-gray-50'}`}>
                      {LANG_EMOJI[lang] ?? '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-900 text-sm truncate">{s.groups?.courses?.name}</p>
                        {isNext && <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Next</span>}
                        {isActive && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />LIVE</span>}
                      </div>
                      <p className="text-xs text-gray-400">with {s.groups?.profiles?.name ?? 'your teacher'}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-2">{fmt(s.scheduled_at)}</p>
                      <p className="text-xs text-gray-400">{s.duration_minutes} min · {timeUntil(s.scheduled_at, nowMs)}</p>
                      {s.notes && (
                        <div className="mt-3 bg-purple-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-purple-700 mb-0.5">Teacher notes</p>
                          <p className="text-xs text-purple-600">{s.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Link
                        href={`/student/session/${s.room_token}`}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                          joinable
                            ? 'bg-brand-500 text-white hover:bg-brand-600'
                            : 'bg-gray-100 text-gray-400 pointer-events-none'
                        }`}
                      >
                        {isActive ? 'Join Now →' : joinable ? 'Join →' : 'Lobby →'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-3">Past Sessions ({past.length})</h2>
          <div className="space-y-3">
            {past.map(s => {
              const lang = s.groups?.courses?.language ?? ''
              const completed = s.status === 'completed'
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      {LANG_EMOJI[lang] ?? '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm truncate">{s.groups?.courses?.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${completed ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-400'}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">with {s.groups?.profiles?.name ?? 'your teacher'}</p>
                      <p className="text-xs text-gray-500 mt-1">{fmt(s.scheduled_at)} · {s.duration_minutes} min</p>

                      {s.notes && (
                        <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-gray-600 mb-0.5">Teacher notes</p>
                          <p className="text-xs text-gray-500 italic">{s.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {s.recording_url && (
                        <a
                          href={s.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          ▶ Recording
                        </a>
                      )}
                      {!s.recording_url && completed && (
                        <span className="text-[10px] text-gray-300 bg-gray-50 px-3 py-1.5 rounded-xl">
                          No recording
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type TeacherProfile = Pick<Profile, 'id' | 'name' | 'avatar_url'> & {
  bio?: string | null
  years_experience?: number | null
  languages_taught?: { lang: string; proficiency: string }[] | null
}

type SessionRow = Session & {
  topic?: string | null
  prep_notes?: string | null
  session_notes?: string | null
  homework_text?: string | null
  homework_url?: string | null
  groups: (Group & {
    week_start?: string | null
    courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
    profiles: TeacherProfile | null
  }) | null
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function buildSessionMeta(sessions: SessionRow[]) {
  const byGroup = new Map<string, SessionRow[]>()
  for (const s of sessions) {
    const list = byGroup.get(s.group_id) ?? []
    list.push(s)
    byGroup.set(s.group_id, list)
  }
  const indexMap = new Map<string, number>()
  for (const [, list] of byGroup) {
    list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    list.forEach((s, i) => indexMap.set(s.id, i + 1))
  }
  return indexMap
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

export function StudentSessionsClient({ sessions }: { sessions: SessionRow[] }) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null)

  const sessionIndexMap = useMemo(() => buildSessionMeta(sessions), [sessions])
  const nowMs = Date.now()
  const missed = sessions
    .filter(s => s.status === 'scheduled' && new Date(s.scheduled_at).getTime() < nowMs)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
  const upcoming = sessions
    .filter(s => s.status === 'active' || (s.status === 'scheduled' && new Date(s.scheduled_at).getTime() >= nowMs))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const completed = sessions
    .filter(s => s.status === 'completed' || s.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())

  const activeSessions = activeTab === 'upcoming' ? upcoming : completed

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-fit">
        {(['upcoming', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Missed sessions banner — only shown in upcoming tab */}
      {activeTab === 'upcoming' && missed.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">
              {missed.length} session{missed.length > 1 ? 's' : ''} missed
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {missed.length > 1
                ? `${missed.length} scheduled sessions passed without being completed.`
                : `"${missed[0].groups?.courses?.name}" on ${fmt(missed[0].scheduled_at)} was not completed.`}
              {' '}Contact your teacher if you need to reschedule.
            </p>
          </div>
        </div>
      )}

      {/* Missed session cards — shown above upcoming */}
      {activeTab === 'upcoming' && missed.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Missed Sessions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {missed.map(s => {
              const lang = s.groups?.courses?.language ?? ''
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden flex flex-col opacity-80">
                  <div className="h-1 bg-amber-300" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">
                        {LANG_EMOJI[lang] ?? '📅'}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        Missed
                      </span>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                        {s.groups?.courses?.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.groups?.courses?.level} · {s.groups?.profiles?.name ?? 'Teacher'}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-start gap-2 text-gray-600">
                        <span className="text-sm mt-0.5">🕒</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{fmt(s.scheduled_at)}</p>
                          <p className="text-xs text-amber-500 mt-0.5 font-semibold">Session time has passed</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSession(s)}
                          className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors"
                        >
                          Details
                        </button>
                        <div className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-400 font-semibold text-xs text-center cursor-not-allowed">
                          Can&apos;t Join
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeSessions.length === 0 && !(activeTab === 'upcoming' && missed.length > 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-4xl mb-4">{activeTab === 'upcoming' ? '📅' : '🏁'}</p>
          <p className="font-bold text-gray-700 mb-1">
            {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No completed sessions yet'}
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {activeTab === 'upcoming'
              ? 'When your course begins, sessions will appear here.'
              : 'Sessions you attend will show here with homework and materials.'}
          </p>
        </div>
      ) : activeSessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSessions.map((s, i) => {
            const lang = s.groups?.courses?.language ?? ''
            const isActive = s.status === 'active'
            const msUntil = new Date(s.scheduled_at).getTime() - nowMs
            const joinable = isActive || msUntil < 15 * 60_000
            const isNext = activeTab === 'upcoming' && i === 0

            return (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
                  isNext ? 'border-purple-200' : 'border-gray-100'
                }`}
              >
                {/* Top accent */}
                <div className={`h-1 ${isNext ? 'bg-[#6c4ff5]' : 'bg-gray-100'}`} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                      {LANG_EMOJI[lang] ?? '📅'}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {isActive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold animate-pulse">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          Live
                        </span>
                      )}
                      {isNext && !isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                          Next
                        </span>
                      )}
                      {s.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          Done
                        </span>
                      )}
                      {s.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                      {s.groups?.courses?.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.groups?.courses?.level} · {s.groups?.profiles?.name ?? 'Teacher'}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-start gap-2 text-gray-600">
                      <span className="text-sm mt-0.5">🕒</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{fmt(s.scheduled_at)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.duration_minutes}m · {timeUntil(s.scheduled_at, nowMs)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors"
                      >
                        Details
                      </button>
                      {activeTab === 'upcoming' && (
                        <Link
                          href={`/student/session/${s.room_token}`}
                          className={`flex-1 px-3 py-2 rounded-xl font-semibold text-xs text-center transition-colors ${
                            joinable
                              ? 'bg-[#6c4ff5] text-white hover:bg-[#5c3de8]'
                              : 'bg-gray-100 text-gray-400 pointer-events-none'
                          }`}
                        >
                          {isActive ? 'Join Now' : 'Join Room'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          nowMs={nowMs}
          sessionNumber={sessionIndexMap.get(selectedSession.id) ?? 1}
        />
      )}
    </div>
  )
}

function SessionDetailModal({
  session, onClose, nowMs, sessionNumber,
}: {
  session: SessionRow
  onClose: () => void
  nowMs: number
  sessionNumber: number
}) {
  const isCompleted = session.status === 'completed'
  const isMissed = session.status === 'scheduled' && new Date(session.scheduled_at).getTime() < nowMs
  const isUpcoming = session.status === 'active' || (session.status === 'scheduled' && !isMissed)
  const lang = session.groups?.courses?.language ?? ''
  const msUntil = new Date(session.scheduled_at).getTime() - nowMs
  const joinable = isUpcoming && (session.status === 'active' || msUntil < 15 * 60_000)

  const weekStart = session.groups?.week_start
  const weekNumber = weekStart
    ? Math.max(1, Math.floor((new Date(session.scheduled_at).getTime() - new Date(weekStart).getTime()) / (7 * 86_400_000)) + 1)
    : null
  const totalSessions = (session.groups?.courses?.sessions_per_week ?? 1) * (session.groups?.courses?.duration_weeks ?? 1)
  const teacher = session.groups?.profiles ?? null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
              {LANG_EMOJI[lang] ?? '📅'}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{session.groups?.courses?.name}</h2>
              <p className="text-xs text-gray-400">{session.groups?.courses?.level} · {lang}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Scheduled</p>
              <p className="text-sm font-semibold text-gray-900">{fmt(session.scheduled_at)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-3">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Week</p>
              <p className="text-sm font-bold text-purple-800">
                {weekNumber ? `${ordinal(weekNumber)} Week` : '—'}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Session</p>
              <p className="text-sm font-bold text-blue-800">{sessionNumber} of {totalSessions}</p>
            </div>
          </div>

          {/* Teacher info */}
          {teacher && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Teacher</p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c4ff5] to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                  {teacher.name?.charAt(0) ?? 'T'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{teacher.name}</p>
                  {teacher.years_experience != null && (
                    <p className="text-xs text-gray-500 mt-0.5">{teacher.years_experience} yr{teacher.years_experience !== 1 ? 's' : ''} experience</p>
                  )}
                  {teacher.bio && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{teacher.bio}</p>
                  )}
                  {teacher.languages_taught && teacher.languages_taught.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teacher.languages_taught.map((l, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {l.lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="space-y-4">
              {/* Homework */}
              <section className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                <h3 className="font-bold text-purple-900 mb-2 text-sm">Homework</h3>
                {session.homework_text ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{session.homework_text}</p>
                    {session.homework_url && (
                      <a
                        href={session.homework_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#6c4ff5] text-white rounded-xl font-semibold text-xs hover:bg-[#5c3de8] transition-colors"
                      >
                        🔗 Open Resource
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-purple-400 italic">No homework assigned.</p>
                )}
              </section>

              {session.topic && (
                <section className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-700 mb-2 text-sm">Topic Covered</h3>
                  <p className="text-sm text-gray-800">{session.topic}</p>
                </section>
              )}

              {session.recording_url && (
                <a
                  href={session.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4 hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">▶</div>
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Watch replay</p>
                    <p className="text-xs text-green-600">Review your conversation</p>
                  </div>
                </a>
              )}
            </div>
          ) : isMissed ? (
            <div className="space-y-4">
              {session.topic && (
                <section className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                  <h3 className="font-bold text-purple-900 mb-1 text-sm">Planned Topic</h3>
                  <p className="text-sm text-purple-800">{session.topic}</p>
                </section>
              )}
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <p className="text-2xl mb-2">😔</p>
                <p className="text-sm font-bold text-amber-800 mb-1">Session Missed</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This session was scheduled for {fmt(session.scheduled_at)} but was not completed. You can no longer join.
                </p>
                <p className="text-xs text-amber-600 mt-2">Contact your teacher to reschedule if needed.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {session.topic && (
                <section className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                  <h3 className="font-bold text-purple-900 mb-1 text-sm">Upcoming Topic</h3>
                  <p className="text-sm text-purple-800">{session.topic}</p>
                </section>
              )}

              {session.prep_notes && (
                <section className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                  <h3 className="font-bold text-amber-800 mb-1 text-sm">Teacher Notes</h3>
                  <p className="text-sm text-amber-900 italic leading-relaxed">&ldquo;{session.prep_notes}&rdquo;</p>
                </section>
              )}

              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {joinable ? 'Room is ready' : 'Opens 15 min before session'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {joinable
                    ? 'Your teacher is waiting.'
                    : `Starts ${fmt(session.scheduled_at)}`}
                </p>
                {joinable ? (
                  <Link
                    href={`/student/session/${session.room_token}`}
                    className="inline-block w-full py-2.5 rounded-xl bg-[#6c4ff5] text-white font-semibold text-sm hover:bg-[#5c3de8] transition-colors"
                  >
                    Join Session
                  </Link>
                ) : (
                  <div className="py-2.5 rounded-xl bg-gray-200 text-gray-400 font-semibold text-sm">
                    Not yet available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

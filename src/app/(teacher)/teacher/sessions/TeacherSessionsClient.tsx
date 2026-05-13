'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Session, Group, Course, Profile, GroupMember } from '@/lib/supabase/types'

type SessionRow = Session & {
  topic?: string | null
  prep_notes?: string | null
  session_notes?: string | null
  homework_text?: string | null
  homework_url?: string | null
  groups: (Group & {
    week_start?: string | null
    courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
    group_members?: (Pick<GroupMember, 'user_id'> & { profiles: Pick<Profile, 'id' | 'name'> | null })[]
  }) | null
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
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

// Pre-compute session number per group (index within same group sorted by scheduled_at)
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

export function TeacherSessionsClient({ sessions }: { sessions: SessionRow[] }) {
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
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      {/* Missed sessions banner — only shown in upcoming tab */}
      {activeTab === 'upcoming' && missed.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">
              {missed.length} session{missed.length > 1 ? 's' : ''} not started
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {missed.length > 1
                ? `${missed.length} sessions passed their scheduled time without being started.`
                : `"${missed[0].groups?.courses?.name}" on ${fmt(missed[0].scheduled_at)} was not started.`}
              {' '}Update the session status or contact support if this was an error.
            </p>
          </div>
        </div>
      )}

      {/* Missed session cards */}
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
                        {LANG_EMOJI[lang] ?? '🏫'}
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
                        {s.groups?.courses?.level} · {lang}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-start gap-2">
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
                          Not Started
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
          <p className="text-4xl mb-4">{activeTab === 'upcoming' ? '📅' : '📂'}</p>
          <p className="font-bold text-gray-700 mb-1">
            {activeTab === 'upcoming' ? 'No scheduled sessions' : 'No history yet'}
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {activeTab === 'upcoming'
              ? 'Upcoming classes appear here when groups are assigned to you.'
              : 'Completed sessions will appear here with notes and homework.'}
          </p>
        </div>
      ) : activeSessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSessions.map((s, i) => {
            const lang = s.groups?.courses?.language ?? ''
            const isActive = s.status === 'active'
            const msUntil = new Date(s.scheduled_at).getTime() - nowMs
            const joinable = isActive || msUntil < 30 * 60_000
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
                      {LANG_EMOJI[lang] ?? '🏫'}
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
                      {s.groups?.courses?.level} · {lang}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-start gap-2">
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
                          href={`/teacher/session/${s.room_token}`}
                          className={`flex-1 px-3 py-2 rounded-xl font-semibold text-xs text-center transition-colors ${
                            joinable
                              ? 'bg-[#6c4ff5] text-white hover:bg-[#5c3de8]'
                              : 'bg-gray-100 text-gray-400 pointer-events-none'
                          }`}
                        >
                          {isActive ? 'Continue' : 'Start Class'}
                        </Link>
                      )}
                      {activeTab === 'completed' && s.status === 'completed' && (
                        <Link
                          href={`/teacher/session/${s.room_token}/post-call`}
                          className="flex-1 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 font-semibold text-xs text-center hover:bg-green-100 transition-colors"
                        >
                          Edit Recap
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
        <TeacherSessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          nowMs={nowMs}
          sessionNumber={sessionIndexMap.get(selectedSession.id) ?? 1}
        />
      )}
    </div>
  )
}

function TeacherSessionDetailModal({
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
  const joinable = isUpcoming && (session.status === 'active' || msUntil < 30 * 60_000)

  const weekStart = session.groups?.week_start
  const weekNumber = weekStart
    ? Math.max(1, Math.floor((new Date(session.scheduled_at).getTime() - new Date(weekStart).getTime()) / (7 * 86_400_000)) + 1)
    : null
  const totalSessions = (session.groups?.courses?.sessions_per_week ?? 1) * (session.groups?.courses?.duration_weeks ?? 1)

  const students = (session.groups?.group_members ?? [])
    .map(m => m.profiles?.name ?? 'Student')
    .filter(Boolean)

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
              {LANG_EMOJI[lang] ?? '🏫'}
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
              <p className="text-sm font-bold text-blue-800">
                {sessionNumber} of {totalSessions}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Level</p>
              <p className="text-sm font-semibold text-gray-900">{session.groups?.courses?.level ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <p className={`text-sm font-semibold capitalize ${
                session.status === 'completed' ? 'text-green-600' :
                session.status === 'active' ? 'text-red-600' :
                'text-[#6c4ff5]'
              }`}>{session.status}</p>
            </div>
          </div>

          {/* Students */}
          {students.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Students ({students.length})</p>
              <div className="flex flex-wrap gap-2">
                {students.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                      {name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="space-y-4">
              {/* Session Notes */}
              <section className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">Session Notes</h3>
                {session.session_notes ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap italic">&ldquo;{session.session_notes}&rdquo;</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No session notes recorded.</p>
                )}
              </section>

              {/* Homework */}
              <section className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                <h3 className="font-bold text-purple-900 mb-2 text-sm">Homework Assigned</h3>
                {session.homework_text ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 leading-relaxed">{session.homework_text}</p>
                    {session.homework_url && (
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-purple-100 text-xs font-semibold text-purple-700 truncate">
                        🔗 {session.homework_url}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-purple-400 italic">No homework assigned.</p>
                )}
              </section>
            </div>
          ) : isMissed ? (
            <div className="space-y-4">
              <section className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">Planned Topic</h3>
                <p className="text-sm text-gray-800">{session.topic || 'Live conversation practice'}</p>
              </section>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <p className="text-2xl mb-2">⚠️</p>
                <p className="text-sm font-bold text-amber-800 mb-1">Session Not Started</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This session was scheduled for {fmt(session.scheduled_at)} but was never started. Students could not join.
                </p>
                <p className="text-xs text-amber-600 mt-2">Mark it as cancelled or contact support to reschedule.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Planned Topic */}
              <section className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">Planned Topic</h3>
                <p className="text-sm text-gray-800">{session.topic || 'Live conversation practice'}</p>
              </section>

              {/* Prep Notes */}
              <section className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                <h3 className="font-bold text-amber-800 mb-2 text-sm">Prep Notes</h3>
                {session.prep_notes ? (
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{session.prep_notes}</p>
                ) : (
                  <p className="text-sm text-amber-500 italic">No prep notes yet.</p>
                )}
              </section>

              {/* CTA */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {joinable ? 'Room is ready' : 'Opens 30 min before class'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {joinable ? 'Students may already be waiting.' : `Starts ${fmt(session.scheduled_at)}`}
                </p>
                {joinable ? (
                  <Link
                    href={`/teacher/session/${session.room_token}`}
                    className="inline-block w-full py-2.5 rounded-xl bg-[#6c4ff5] text-white font-semibold text-sm hover:bg-[#5c3de8] transition-colors"
                  >
                    Enter Classroom
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
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <Link
            href="/teacher/groups"
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Manage Group →
          </Link>
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

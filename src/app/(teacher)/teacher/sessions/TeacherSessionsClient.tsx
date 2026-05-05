'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type SessionRow = Session & {
  topic?: string | null
  prep_notes?: string | null
  session_notes?: string | null
  homework_text?: string | null
  homework_url?: string | null
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language' | 'level'> | null
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

export function TeacherSessionsClient({ sessions }: { sessions: SessionRow[] }) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null)
  
  const nowMs = new Date().getTime()
  const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'active')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const completed = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())

  const activeSessions = activeTab === 'upcoming' ? upcoming : completed

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-gray-100/80 backdrop-blur rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'upcoming' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'completed' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          History
        </button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center animate-in fade-in zoom-in duration-500">
          <p className="text-5xl mb-6">{activeTab === 'upcoming' ? '📅' : '📂'}</p>
          <p className="text-xl font-bold text-gray-800">
            {activeTab === 'upcoming' ? 'No scheduled sessions' : 'No history yet'}
          </p>
          <p className="text-gray-400 mt-2 max-w-xs mx-auto">
            {activeTab === 'upcoming' 
              ? 'Your upcoming classes will appear here when groups are assigned to you.' 
              : 'Completed sessions will appear here with your notes and homework records.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeSessions.map((s, i) => {
            const lang = s.groups?.courses?.language ?? ''
            const isActive = s.status === 'active'
            const msUntil = new Date(s.scheduled_at).getTime() - nowMs
            const joinable = isActive || msUntil < 30 * 60_000 // 30 min for teachers
            const isNext = activeTab === 'upcoming' && i === 0

            return (
              <div 
                key={s.id} 
                className={`group bg-white rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isNext ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-brand-100'
                }`}
              >
                <div className="p-6 space-y-6">
                  {/* Card Top */}
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                      {LANG_EMOJI[lang] ?? '🏫'}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                          Live Now
                        </span>
                      )}
                      {isNext && !isActive && (
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                          Next Class
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight mb-1 group-hover:text-brand-600 transition-colors">
                      {s.groups?.courses?.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {s.groups?.courses?.level} · {lang}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm">🕒</div>
                      <div>
                        <p className="text-sm font-bold leading-none">{fmt(s.scheduled_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                          {s.duration_minutes} Minutes · {timeUntil(s.scheduled_at, nowMs)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 text-gray-900 font-bold text-xs hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                    >
                      Class Intel
                    </button>
                    {activeTab === 'upcoming' && (
                      <Link
                        href={`/teacher/session/${s.room_token}`}
                        className={`flex-1 px-4 py-3 rounded-2xl font-bold text-xs text-center transition-all active:scale-95 shadow-lg ${
                          joinable 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-100' 
                            : 'bg-gray-200 text-gray-400 pointer-events-none'
                        }`}
                      >
                        {isActive ? 'Continue Class' : 'Start Class'}
                      </Link>
                    )}
                    {activeTab === 'completed' && s.status === 'completed' && (
                      <Link
                        href={`/teacher/session/${s.room_token}/post-call`}
                        className="flex-1 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100 text-center"
                      >
                        Edit Recap
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSession && (
        <TeacherSessionDetailModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
          nowMs={nowMs}
        />
      )}
    </div>
  )
}

function TeacherSessionDetailModal({ session, onClose, nowMs }: { session: SessionRow; onClose: () => void; nowMs: number }) {
  const isCompleted = session.status === 'completed'
  const isUpcoming = session.status === 'scheduled' || session.status === 'active'
  const lang = session.groups?.courses?.language ?? ''
  
  const msUntil = new Date(session.scheduled_at).getTime() - nowMs
  const joinable = isUpcoming && (session.status === 'active' || msUntil < 30 * 60_000)

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-brand-600 to-indigo-700 p-8 flex flex-col justify-end">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl">
              {LANG_EMOJI[lang] ?? '🏫'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{session.groups?.courses?.name}</h2>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest">
                Teacher Dashboard · Session Intel
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
              <p className="text-xs font-bold text-gray-900">{fmt(session.scheduled_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Level</p>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter">{session.groups?.courses?.level}</p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-xs font-bold uppercase tracking-tighter ${
                session.status === 'completed' ? 'text-emerald-600' : 'text-indigo-600'
              }`}>{session.status}</p>
            </div>
          </div>

          {/* Session Info */}
          {isCompleted ? (
            <div className="space-y-8">
              {/* Internal Notes */}
              <section className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl shadow-gray-200">
                <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                  Your Session Notes
                </h3>
                {session.session_notes ? (
                  <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap italic">
                    &quot;{session.session_notes}&quot;
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-sm">No personal notes recorded for this class.</p>
                )}
              </section>

              {/* Homework Sent */}
              <section className="bg-brand-50 rounded-[2rem] p-6 border border-brand-100">
                <h3 className="text-brand-800 font-black text-lg mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                  Homework Assigned
                </h3>
                {session.homework_text ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {session.homework_text}
                    </p>
                    {session.homework_url && (
                      <div className="text-xs font-bold text-brand-600 truncate bg-white px-4 py-2 rounded-xl border border-brand-100">
                        🔗 {session.homework_url}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-brand-400 italic text-sm">No homework was assigned.</p>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Topic */}
              <section>
                <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                  Planned Topic
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-800 font-bold">{session.topic || 'Live conversation practice'}</p>
                  <p className="text-xs text-gray-400 mt-1">Make sure to cover the core vocabulary for this week.</p>
                </div>
              </section>

              {/* Prep Notes */}
              <section>
                <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  Your Prep Notes
                </h3>
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  {session.prep_notes ? (
                    <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">
                      {session.prep_notes}
                    </p>
                  ) : (
                    <p className="text-amber-600 italic text-sm">You haven&apos;t added any prep notes yet.</p>
                  )}
                </div>
              </section>

              {/* Start CTA */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-center text-white space-y-6">
                <div className="text-4xl">🎓</div>
                <div>
                  <h4 className="text-xl font-black">Ready to teach?</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {joinable 
                      ? 'Room is ready for you to start the lesson.' 
                      : 'The start button will activate 30 minutes before class.'}
                  </p>
                </div>
                {joinable ? (
                  <Link 
                    href={`/teacher/session/${session.room_token}`}
                    className="block w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    Enter Classroom
                  </Link>
                ) : (
                  <div className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-base">
                    Room Locked
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
           <Link
            href="/teacher/groups"
            className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-all active:scale-95 flex items-center"
          >
            Manage Group
          </Link>
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

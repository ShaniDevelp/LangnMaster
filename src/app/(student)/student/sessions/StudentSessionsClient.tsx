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
    profiles: Pick<Profile, 'name' | 'avatar_url'> | null
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

export function StudentSessionsClient({ sessions }: { sessions: SessionRow[] }) {
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
      <div className="flex p-1 bg-gray-100 rounded-2xl w-full sm:w-fit overflow-hidden">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'upcoming' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'completed' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Completed
        </button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center animate-in fade-in zoom-in duration-500">
          <p className="text-5xl mb-6">{activeTab === 'upcoming' ? '📅' : '🏁'}</p>
          <p className="text-xl font-bold text-gray-800">
            {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No completed sessions yet'}
          </p>
          <p className="text-gray-400 mt-2 max-w-xs mx-auto">
            {activeTab === 'upcoming' 
              ? 'When your course begins, you will see your scheduled meetings here.' 
              : 'Sessions you attend will appear here with your homework and recordings.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {activeSessions.map((s, i) => {
            const lang = s.groups?.courses?.language ?? ''
            const isActive = s.status === 'active'
            const msUntil = new Date(s.scheduled_at).getTime() - nowMs
            const joinable = isActive || msUntil < 15 * 60_000 // 15 min early
            const isNext = activeTab === 'upcoming' && i === 0

            return (
              <div 
                key={s.id} 
                className={`group bg-white rounded-3xl border transition-all duration-300 hover:shadow-lg overflow-hidden flex flex-col ${
                  isNext ? 'border-brand-200 ring-4 ring-brand-50/50' : 'border-gray-100 hover:border-brand-200'
                }`}
              >
                {/* Accent line */}
                <div className={`h-1.5 bg-gradient-to-r ${isNext ? 'from-brand-400 to-brand-600' : 'from-gray-100 to-gray-200'}`} />
                
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                      {LANG_EMOJI[lang] ?? '📅'}
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        LIVE
                      </span>
                    ) : isNext ? (
                      <span className="px-2 py-1 rounded-lg bg-brand-100 text-brand-600 text-[9px] font-black uppercase tracking-widest">
                        NEXT
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                      {s.groups?.courses?.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {s.groups?.courses?.level} · {s.groups?.profiles?.name ?? 'Teacher'}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="text-base flex-shrink-0">🕒</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{fmt(s.scheduled_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate uppercase">
                          {s.duration_minutes}m · {timeUntil(s.scheduled_at, nowMs)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                      >
                        Details
                      </button>
                      {activeTab === 'upcoming' && (
                        <Link
                          href={`/student/session/${s.room_token}`}
                          className={`flex-1 px-3 py-2.5 rounded-xl font-bold text-xs text-center transition-all active:scale-95 ${
                            joinable 
                              ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-200' 
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
      )}

      {/* Detail Modal */}
      {selectedSession && (
        <SessionDetailModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
          nowMs={nowMs}
        />
      )}
    </div>
  )
}

function SessionDetailModal({ session, onClose, nowMs }: { session: SessionRow; onClose: () => void; nowMs: number }) {
  const isCompleted = session.status === 'completed'
  const isUpcoming = session.status === 'scheduled' || session.status === 'active'
  const lang = session.groups?.courses?.language ?? ''
  
  const msUntil = new Date(session.scheduled_at).getTime() - nowMs
  const joinable = isUpcoming && (session.status === 'active' || msUntil < 15 * 60_000)

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
        <div className="relative h-40 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex flex-col justify-end">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl">
              {LANG_EMOJI[lang] ?? '📅'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{session.groups?.courses?.name}</h2>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest">
                Session with {session.groups?.profiles?.name ?? 'Teacher'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Time and Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scheduled At</p>
              <p className="text-sm font-bold text-gray-900">{fmt(session.scheduled_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
              <p className="text-sm font-bold text-gray-900">{session.duration_minutes} Minutes</p>
            </div>
          </div>

          {/* Status Specific Content */}
          {isCompleted ? (
            <div className="space-y-8">
              {/* Homework */}
              <section className="bg-brand-50 rounded-[2rem] p-6 border border-brand-100">
                <h3 className="text-brand-800 font-black text-lg mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                  Your Homework
                </h3>
                {session.homework_text ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {session.homework_text}
                    </p>
                    {session.homework_url && (
                      <a 
                        href={session.homework_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-100"
                      >
                        🔗 Open Resource
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-brand-400 italic text-sm">No homework was assigned for this session.</p>
                )}
              </section>

              {/* Session Summary */}
              {session.topic && (
                <section>
                  <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    Topic Covered
                  </h3>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-800 font-bold">{session.topic}</p>
                  </div>
                </section>
              )}

              {session.recording_url && (
                <section>
                  <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    Session Recording
                  </h3>
                  <a 
                    href={session.recording_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-100 group hover:bg-emerald-100 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                      ▶
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900">Watch the replay</p>
                      <p className="text-xs text-emerald-600">Review your conversation and practice again.</p>
                    </div>
                  </a>
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Topic Prep */}
              {session.topic && (
                <section>
                  <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                    Upcoming Topic
                  </h3>
                  <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                    <p className="text-brand-900 font-bold">{session.topic}</p>
                    <p className="text-xs text-brand-600 mt-1">Get ready for our conversation about this!</p>
                  </div>
                </section>
              )}

              {/* Prep Notes */}
              {session.prep_notes && (
                <section>
                  <h3 className="text-gray-900 font-black text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    Teacher Notes
                  </h3>
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <p className="text-amber-900 text-sm leading-relaxed italic">
                      &quot;{session.prep_notes}&quot;
                    </p>
                  </div>
                </section>
              )}

              {/* Join CTA */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-center text-white space-y-6">
                <div className="text-4xl">🎥</div>
                <div>
                  <h4 className="text-xl font-black">Ready to join?</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {joinable 
                      ? 'The teacher is waiting or the session starts soon.' 
                      : `This session will be open for joining on ${fmt(session.scheduled_at)}.`}
                  </p>
                </div>
                {joinable ? (
                  <Link 
                    href={`/student/session/${session.room_token}`}
                    className="block w-full py-4 rounded-2xl bg-brand-500 text-white font-bold text-base hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
                  >
                    Join the Session Now
                  </Link>
                ) : (
                  <div className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-base">
                    Room Opens Soon
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

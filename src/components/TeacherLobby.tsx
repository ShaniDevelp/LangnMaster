'use client'
import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VideoCallRoom } from '@/components/VideoCallRoom'
import { savePreCallNotes } from '@/lib/teacher/session-actions'

type Student = {
  id: string
  name: string
}

type LobbyProps = {
  sessionId: string
  roomToken: string
  courseName: string
  language: string
  level: string
  scheduledAt: string
  userId: string
  userName: string
  students: Student[]
  existingTopic?: string
  existingPrepNotes?: string
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black flex-shrink-0 shadow-lg shadow-indigo-500/20 uppercase`}>
      {name.charAt(0)}
    </div>
  )
}

export function TeacherLobby(props: LobbyProps) {
  const {
    sessionId, roomToken, courseName, language, level,
    scheduledAt, userId, userName, students,
    existingTopic, existingPrepNotes,
  } = props

  const [inCall, setInCall] = useState(false)
  const [topic, setTopic] = useState(existingTopic ?? '')
  const [prepNotes, setPrepNotes] = useState(existingPrepNotes ?? '')
  const [camOk, setCamOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [saving, startSave] = useTransition()
  const [starting, startStart] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [stream])

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  async function testDevices() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s); setCamOk(true); setMicOk(true)
    } catch {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }); setMicOk(true) } catch { /* denied */ }
    }
  }

  function handleSaveNotes() {
    startSave(async () => {
      const res = await savePreCallNotes(sessionId, { topic, prep_notes: prepNotes })
      setSaveMsg(res.error ? `Error: ${res.error}` : 'Changes saved ✓')
      setTimeout(() => setSaveMsg(null), 3000)
    })
  }

  function handleStartClass() {
    startStart(async () => {
      stream?.getTracks().forEach(t => t.stop())
      setStream(null)
      setInCall(true)
    })
  }

  const formattedTime = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  const isLive = new Date(scheduledAt) <= new Date()

  if (inCall) {
    return (
      <VideoCallRoom
        roomToken={roomToken}
        sessionId={sessionId}
        userId={userId}
        userName={userName}
        courseName={courseName}
        isTeacher
        onLeave={() => router.push(`/teacher/session/${roomToken}/post-call`)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Minimal Premium Header ── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-sm">LM</div>
            <span className="text-slate-300 font-light text-xl">/</span>
            <span className="text-slate-900 font-black text-sm uppercase tracking-widest">Lobby</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Teacher</p>
                <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
             </div>
             <Avatar name={userName} size="sm" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          
          <div className="space-y-10">
            {/* ── Title & Status ── */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isLive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {isLive ? 'Live Session' : 'Scheduled'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-bold text-sm">{formattedTime}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{courseName}</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">{language} · {level}</p>
            </div>

            {/* ── Camera Preview ── */}
            <div className="relative group rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl shadow-indigo-500/10 border border-white/5 aspect-video flex items-center justify-center">
              {stream ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    📷
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Preview Camera</p>
                  <button onClick={testDevices} className="mt-6 px-8 py-3 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
                    Test Camera & Mic
                  </button>
                </div>
              )}
              
              {stream && (
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                   <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-white font-black text-[10px] uppercase tracking-widest">System Ready</span>
                   </div>
                   <button onClick={() => { stream.getTracks().forEach(t => t.stop()); setStream(null); setCamOk(false); setMicOk(false) }} 
                     className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-2xl backdrop-blur-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all">
                      Off
                   </button>
                </div>
              )}
            </div>

            {/* ── Session Prep ── */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lesson Strategy</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">Set the roadmap for today&apos;s conversation.</p>
                </div>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Syncing...' : saveMsg ?? 'Save Strategy'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Discussing future plans, Travel vocabulary..."
                    className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-4 text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Objectives & Exercises</label>
                  <textarea
                    value={prepNotes}
                    onChange={e => setPrepNotes(e.target.value)}
                    rows={4}
                    placeholder="List specific vocab or grammar focus points here..."
                    className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-4 text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-8">
            {/* Start Session Card */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-indigo-500/10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-brand-50 rounded-[2.5rem] flex items-center justify-center text-3xl mb-6">
                {isLive ? '🚀' : '⏳'}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isLive ? 'Ready to Go?' : 'Class Window'}
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed mb-8 px-4">
                {isLive 
                  ? 'The classroom is open. Enter whenever you&apos;re prepared.' 
                  : `This session starts soon. You can enter early to prep.`}
              </p>
              <button
                onClick={handleStartClass}
                disabled={starting}
                className="w-full py-5 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-xl shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {starting ? 'Initializing...' : 'Launch Classroom'}
              </button>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Enrolled Students</h3>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg">
                  {students.length}
                </span>
              </div>
              <div className="space-y-4">
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-4 group cursor-default">
                    <Avatar name={s.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-500 transition-colors">{s.name}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Student</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-emerald-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-600/20">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60 mb-6">Expert Checklist</h4>
              <ul className="space-y-4">
                {[
                  'Ensure stable high-speed WiFi',
                  'Silence your phone & notifications',
                  'Check lighting & camera angle',
                  'Keep drinking water nearby'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold leading-tight">
                    <span className="text-indigo-300 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

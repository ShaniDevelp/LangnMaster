'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { VideoCallRoom } from '@/components/VideoCallRoom'
import { rateSession } from '@/lib/student/actions'

export type SessionRoomProps = {
  roomToken: string
  sessionId: string
  userId: string
  userName: string
  courseName: string
  courseId: string
  teacherId: string | null
  teacherName: string | null
  partnerName: string | null
  scheduledAt: string
  durationMinutes: number
  prepNotes: string | null
  weekNumber: number
  weekTopic: string | null
  nextSessionAt: string | null
  nextSessionToken: string | null
}

type Phase = 'lobby' | 'call' | 'complete'

// ── Shared Avatar ────────────────────────────────────────────────────────────

function Avatar({ name, role }: { name: string; role?: string }) {
  const isTeacher = role?.toLowerCase() === 'teacher'
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-indigo-500/10 ${
      isTeacher ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-800'
    }`}>
      {name.charAt(0)}
    </div>
  )
}

// ── Lobby Preview ────────────────────────────────────────────────────────────

function PreviewVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camOk, setCamOk] = useState<boolean | null>(null)
  const [micLevel, setMicLevel] = useState(0)

  useEffect(() => {
    let mounted = true
    const rafId = { current: 0 }

    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!mounted) { s.getTracks().forEach(t => t.stop()); return }
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCamOk(true)

        const ctx = new AudioContext()
        const src = ctx.createMediaStreamSource(s)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        src.connect(analyser)
        const data = new Uint8Array(analyser.frequencyBinCount)
        function tick() {
          analyser.getByteFrequencyData(data)
          const avg = data.reduce((a, b) => a + b, 0) / data.length
          setMicLevel(Math.min(avg / 60, 1))
          rafId.current = requestAnimationFrame(tick)
        }
        tick()
      } catch {
        if (mounted) setCamOk(false)
      }
    }
    init()

    return () => {
      mounted = false
      cancelAnimationFrame(rafId.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
        {camOk === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <span className="text-4xl mb-4">📵</span>
            <p className="text-sm font-black uppercase tracking-widest">Camera Denied</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {camOk && (
          <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Preview
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100">
        <span className="text-sm">🎙️</span>
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${micLevel * 100}%`,
              background: micLevel > 0.8 ? '#ef4444' : '#6366f1',
            }}
          />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {camOk === null ? 'Syncing...' : camOk ? 'Mic Active' : 'No Input'}
        </span>
      </div>
    </div>
  )
}

// ── Post-call Rating ──

function PostCallScreen({
  courseId, teacherId, courseName,
  nextSessionAt, nextSessionToken,
}: {
  courseId: string; teacherId: string | null; courseName: string;
  nextSessionAt: string | null; nextSessionToken: string | null;
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (rating === 0) return
    startTransition(async () => {
      await rateSession(courseId, teacherId, rating, body)
      setSubmitted(true)
    })
  }

  function formatNext(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/10 p-12 text-center">
          <div className="w-24 h-24 bg-brand-50 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-brand-500/10">
            {submitted ? '✨' : '🎉'}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
            {submitted ? 'Feedback Received' : 'Class Complete!'}
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            {submitted
              ? 'Thank you for helping us maintain the highest standards of learning.'
              : `You just finished your session in ${courseName}. How was your experience with the teacher?`}
          </p>

          {!submitted && (
            <div className="mt-12 space-y-10">
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="group relative transition-all active:scale-90"
                  >
                    <span className={`text-4xl transition-all duration-300 ${
                      n <= (hover || rating) ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
                    }`}>⭐</span>
                    {n === (hover || rating) && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Masterful'][n]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts on today's lesson..."
                rows={3}
                className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-brand-500 transition-all resize-none"
              />

              <div className="pt-4 flex flex-col gap-4">
                <button
                  onClick={submit}
                  disabled={rating === 0 || isPending}
                  className="w-full bg-brand-500 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-brand-500/30 hover:bg-brand-600 transition-all disabled:opacity-30 active:scale-95"
                >
                  {isPending ? 'Syncing Feedback...' : 'Submit Review'}
                </button>
                <button onClick={() => setSubmitted(true)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="mt-12 space-y-4">
              <Link href="/student/dashboard" className="block w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all active:scale-95">
                Back to Home
              </Link>
              <Link href="/student/sessions" className="block text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 py-2">
                View Learning History →
              </Link>
            </div>
          )}
        </div>

        {submitted && nextSessionAt && (
           <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-600/20 flex items-center justify-between animate-in slide-in-from-bottom-8 duration-700">
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-2">Next Milestone</p>
                <p className="text-xl font-black">{formatNext(nextSessionAt)}</p>
              </div>
              <Link href={`/student/session/${nextSessionToken}`} className="bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-black px-6 py-3 rounded-2xl border border-white/10 text-xs uppercase tracking-widest transition-all">
                Preview
              </Link>
           </div>
        )}
      </div>
    </div>
  )
}

// ── Main SessionRoom ──

export default function SessionRoom({
  roomToken, sessionId, userId, userName,
  courseName, courseId, teacherId, teacherName, partnerName,
  scheduledAt, durationMinutes, prepNotes,
  weekNumber, weekTopic,
  nextSessionAt, nextSessionToken,
}: SessionRoomProps) {
  const [phase, setPhase] = useState<Phase>('lobby')

  const scheduledTime = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  if (phase === 'call') {
    return (
      <VideoCallRoom
        roomToken={roomToken}
        sessionId={sessionId}
        userId={userId}
        userName={userName}
        courseName={courseName}
        onLeave={() => setPhase('complete')}
      />
    )
  }

  if (phase === 'complete') {
    return (
      <PostCallScreen
        courseId={courseId}
        teacherId={teacherId}
        courseName={courseName}
        nextSessionAt={nextSessionAt}
        nextSessionToken={nextSessionToken}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/student/sessions" className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            ←
          </Link>
          <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pre-class Lobby</h2>
             <p className="text-slate-400 text-sm font-medium">Verify your setup and meet your teacher.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          
          <div className="space-y-10">
             {/* Header Info */}
             <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Week {weekNumber}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-indigo-100 font-bold text-sm">{scheduledTime}</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight mb-2">{courseName}</h1>
                  <p className="text-indigo-200 font-medium italic">“{weekTopic ?? 'Open Conversation & Fluency Practice'}”</p>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
             </div>

             {/* Device Check */}
             <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Tech Check</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hardware Ready</span>
                  </div>
                </div>
                <PreviewVideo />
             </div>

             {/* Teacher Notes */}
             {prepNotes && (
               <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📝</div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Prep for Today</h3>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8">
                    <p className="text-slate-600 font-bold leading-relaxed">{prepNotes}</p>
                  </div>
               </div>
             )}
          </div>

          <div className="space-y-10">
             {/* Participants */}
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-indigo-500/10 text-center">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-10">Who&apos;s in the Room</h3>
                <div className="flex flex-col gap-6">
                  {[
                    { name: userName, role: 'Student (You)', profile: 'me' },
                    { name: teacherName ?? 'Teacher', role: 'Teacher', profile: 'teacher' },
                    { name: partnerName, role: 'Learning Partner', profile: 'partner' }
                  ].filter(p => p.name).map(p => (
                    <div key={p.role} className="flex items-center gap-4 text-left group">
                      <Avatar name={p.name!} role={p.profile === 'teacher' ? 'teacher' : ''} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate group-hover:text-brand-500 transition-colors">{p.name}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p.role}</p>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
             </div>

             {/* Final CTA */}
             <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl shadow-indigo-500/10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-brand-50 rounded-[2.5rem] flex items-center justify-center text-3xl mb-8 animate-bounce shadow-xl shadow-brand-500/10">
                  🎙️
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Ready to Speak?</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">
                  Everything is set. Your teacher and classmates are waiting for you in the classroom.
                </p>
                <button
                  onClick={() => setPhase('call')}
                  className="w-full py-6 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm uppercase tracking-widest rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,102,241,0.4)] transition-all active:scale-95"
                >
                  Enter Classroom
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

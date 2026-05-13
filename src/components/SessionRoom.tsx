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
  sessionNumber: number
  totalSessions: number
}

type Phase = 'lobby' | 'call' | 'complete'

function Avatar({ name, variant = 'default' }: { name: string; variant?: 'teacher' | 'default' }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0 ${
      variant === 'teacher'
        ? 'bg-gradient-to-br from-[#6c4ff5] to-purple-600'
        : 'bg-gradient-to-br from-blue-400 to-indigo-500'
    }`}>
      {name.charAt(0)}
    </div>
  )
}

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
    <div className="space-y-3">
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {camOk === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <span className="text-3xl">📵</span>
            <p className="text-sm font-semibold text-gray-400">Camera denied</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {camOk && (
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live Preview
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-base">🎙️</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-100"
            style={{
              width: `${micLevel * 100}%`,
              background: micLevel > 0.8 ? '#ef4444' : '#6c4ff5',
            }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-400">
          {camOk === null ? 'Checking...' : camOk ? 'Mic active' : 'No input'}
        </span>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
            {submitted ? '✨' : '🎉'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {submitted ? 'Feedback received' : 'Session complete!'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {submitted
              ? 'Thank you for helping us maintain high teaching standards.'
              : `You just finished ${courseName}. How was your experience?`}
          </p>

          {!submitted && (
            <div className="mt-8 space-y-6">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="relative transition-transform active:scale-90"
                  >
                    <span className={`text-3xl transition-all duration-200 ${
                      n <= (hover || rating) ? 'opacity-100 scale-110' : 'opacity-25 grayscale'
                    }`}>⭐</span>
                    {n === (hover || rating) && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg whitespace-nowrap">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][n]}
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5] resize-none"
              />

              <div className="flex flex-col gap-3">
                <button
                  onClick={submit}
                  disabled={rating === 0 || isPending}
                  className="w-full bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-30"
                >
                  {isPending ? 'Submitting...' : 'Submit Review'}
                </button>
                <button onClick={() => setSubmitted(true)} className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors py-1">
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/student/dashboard" className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-center transition-colors">
                Back to Dashboard
              </Link>
              <Link href="/student/sessions" className="text-xs font-semibold text-gray-400 hover:text-gray-600 py-1 text-center">
                View learning history →
              </Link>
            </div>
          )}
        </div>

        {submitted && nextSessionAt && (
          <div className="bg-[#6c4ff5] rounded-2xl p-5 text-white flex items-center justify-between gap-4">
            <div>
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">Next Session</p>
              <p className="font-bold">{formatNext(nextSessionAt)}</p>
            </div>
            <Link
              href={`/student/session/${nextSessionToken}`}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Preview
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function SessionRoom({
  roomToken, sessionId, userId, userName,
  courseName, courseId, teacherId, teacherName, partnerName,
  scheduledAt, durationMinutes, prepNotes,
  weekNumber, weekTopic,
  nextSessionAt, nextSessionToken,
  sessionNumber, totalSessions,
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

  const participants = [
    { name: userName, role: 'Student (You)', variant: 'default' as const },
    teacherName ? { name: teacherName, role: 'Teacher', variant: 'teacher' as const } : null,
    partnerName ? { name: partnerName, role: 'Learning Partner', variant: 'default' as const } : null,
  ].filter(Boolean) as { name: string; role: string; variant: 'teacher' | 'default' }[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/student/sessions"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ←
            </Link>
            <span className="font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Pre-Class Lobby</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase">
              {userName.charAt(0)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left column */}
          <div className="space-y-5">

            {/* Course Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                  {ordinal(weekNumber)} Week
                </span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                  Session {sessionNumber} of {totalSessions}
                </span>
                <span className="text-xs text-gray-400">{scheduledTime}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{courseName}</h1>
              {weekTopic && (
                <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{weekTopic}&rdquo;</p>
              )}
            </div>

            {/* Tech Check */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Tech Check</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-gray-400">Hardware ready</span>
                </div>
              </div>
              <PreviewVideo />
            </div>

            {/* Prep Notes */}
            {prepNotes && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📝</div>
                  <h2 className="font-bold text-gray-900">Prep for Today</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{prepNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Participants */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Who&apos;s in the Room</h2>
              <div className="space-y-3">
                {participants.map(p => (
                  <div key={p.role} className="flex items-center gap-3">
                    <Avatar name={p.name} variant={p.variant} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.role}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-4">
                🎙️
              </div>
              <h2 className="font-bold text-gray-900 mb-1">Ready to Speak?</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Your teacher and classmates are waiting in the classroom.
              </p>
              <button
                onClick={() => setPhase('call')}
                className="w-full py-3 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold rounded-xl shadow-md shadow-purple-200 transition-colors active:scale-95"
              >
                Enter Classroom
              </button>
            </div>

            {/* Duration info */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Session duration</span>
                <span className="font-semibold text-gray-700">{durationMinutes} min</span>
              </div>
              {nextSessionAt && (
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Next session</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(nextSessionAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

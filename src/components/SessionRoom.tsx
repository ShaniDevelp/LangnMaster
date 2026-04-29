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

// ── Lobby ────────────────────────────────────────────────────────────────────

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

        // Mic level
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
      <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
        {camOk === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">📵</span>
            <p className="text-sm">Camera not available</p>
            <p className="text-xs mt-1 text-gray-500">
              <Link href="/student/device-check" className="underline">Check settings →</Link>
            </p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {camOk && (
          <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Preview
          </div>
        )}
      </div>

      {/* Mic bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm">🎙️</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-75"
            style={{
              width: `${micLevel * 100}%`,
              background: micLevel > 0.8 ? '#ef4444' : micLevel > 0.5 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>
        <span className="text-xs text-gray-400 w-20 text-right">
          {camOk === null ? 'Requesting…' : camOk ? 'Mic active' : 'No mic'}
        </span>
      </div>
    </div>
  )
}

// ── Post-call rating ─────────────────────────────────────────────────────────

function PostCallScreen({
  courseId,
  teacherId,
  courseName,
  nextSessionAt,
  nextSessionToken,
}: {
  courseId: string
  teacherId: string | null
  courseName: string
  nextSessionAt: string | null
  nextSessionToken: string | null
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

        {/* Completion banner */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">{submitted ? '✅' : '🎉'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {submitted ? 'Thanks for the feedback!' : 'Session complete!'}
          </h1>
          <p className="text-gray-500 text-sm">
            {submitted
              ? 'Your rating helps us improve and match you with better teachers.'
              : `Great work in ${courseName}. How did it go?`}
          </p>
        </div>

        {/* Rating form */}
        {!submitted && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <p className="font-semibold text-gray-900 mb-3 text-sm">Rate this session</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                  >
                    {n <= (hover || rating) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Anything to share? <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="What went well? What could be better?"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 resize-none"
              />
            </div>

            <button
              onClick={submit}
              disabled={rating === 0 || isPending}
              className="w-full bg-brand-500 text-white font-bold py-3.5 rounded-2xl hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Submitting…' : 'Submit feedback'}
            </button>

            <button
              onClick={() => setSubmitted(true)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Next session preview */}
        {nextSessionAt && nextSessionToken && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Next session</p>
              <p className="font-bold text-gray-900 text-sm">{formatNext(nextSessionAt)}</p>
            </div>
            <Link
              href={`/student/session/${nextSessionToken}`}
              className="text-xs font-bold bg-brand-500 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors flex-shrink-0"
            >
              Preview →
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/student/dashboard"
            className="flex-1 text-center bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/student/sessions"
            className="flex-1 text-center bg-brand-500 text-white font-semibold py-3 rounded-2xl hover:bg-brand-600 transition-colors text-sm"
          >
            All sessions →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── SessionRoom (lobby → call → complete) ────────────────────────────────────

export default function SessionRoom({
  roomToken, sessionId, userId, userName,
  courseName, courseId, teacherId, teacherName, partnerName,
  scheduledAt, durationMinutes, prepNotes,
  weekNumber, weekTopic,
  nextSessionAt, nextSessionToken,
}: SessionRoomProps) {
  const [phase, setPhase] = useState<Phase>('lobby')

  const scheduledTime = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
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

  // Lobby
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back */}
      <Link href="/student/sessions" className="text-sm text-gray-400 hover:text-gray-600">
        ← My sessions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left: camera/mic check */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{courseName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{scheduledTime} · {durationMinutes} min</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Camera & microphone check</p>
            <PreviewVideo />
          </div>

          {/* Prep notes from teacher */}
          {prepNotes && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Teacher notes</p>
              <p className="text-sm text-purple-800 leading-relaxed">{prepNotes}</p>
            </div>
          )}
        </div>

        {/* Right: session info + join */}
        <div className="space-y-4">
          {/* Participants */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">In this session</p>
            <div className="space-y-3">
              {[
                { name: userName, role: 'You', grad: 'from-brand-400 to-indigo-500' },
                { name: teacherName ?? 'Teacher', role: 'Teacher', grad: 'from-pink-400 to-rose-500' },
                { name: partnerName ?? 'Partner', role: 'Partner', grad: 'from-emerald-400 to-teal-500' },
              ].map(p => (
                <div key={p.role} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session topic */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Week {weekNumber}
            </p>
            <p className="font-bold text-gray-900">
              {weekTopic ?? 'Live conversation practice'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Today&apos;s focus topic</p>
          </div>

          {/* Join button */}
          <button
            onClick={() => setPhase('call')}
            className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200 text-base flex items-center justify-center gap-2"
          >
            🎥 I&apos;m ready — Join session
          </button>

          <p className="text-center text-xs text-gray-400">
            Make sure your camera and mic are working before joining.
          </p>
        </div>
      </div>
    </div>
  )
}

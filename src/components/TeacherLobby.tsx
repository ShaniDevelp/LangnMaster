'use client'
import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
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
  weekNumber: number
  sessionNumber: number
  totalSessions: number
  existingTopic?: string
  existingPrepNotes?: string
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c4ff5] to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
      {name.charAt(0)}
    </div>
  )
}

export function TeacherLobby(props: LobbyProps) {
  const {
    sessionId, roomToken, courseName, language, level,
    scheduledAt, userId, userName, students,
    weekNumber, sessionNumber, totalSessions,
    existingTopic, existingPrepNotes,
  } = props

  const [inCall, setInCall] = useState(false)
  const [topic, setTopic] = useState(existingTopic ?? '')
  const [prepNotes, setPrepNotes] = useState(existingPrepNotes ?? '')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [camOk, setCamOk] = useState(false)
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
      setStream(s); setCamOk(true)
    } catch {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }) } catch { /* denied */ }
    }
  }

  function handleSaveNotes() {
    startSave(async () => {
      const res = await savePreCallNotes(sessionId, { topic, prep_notes: prepNotes })
      setSaveMsg(res.error ? `Error: ${res.error}` : 'Saved ✓')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ←
            </Link>
            <span className="font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Teacher Lobby</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={userName} />
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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isLive ? 'Live Now' : 'Upcoming'}
                </span>
                <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                  {ordinal(weekNumber)} Week
                </span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                  Session {sessionNumber} of {totalSessions}
                </span>
                <span className="text-xs text-gray-400">{formattedTime}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{courseName}</h1>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                {language} · {level}
              </p>
            </div>

            {/* Camera Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Camera Preview</h2>
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                {stream ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📷</div>
                    <p className="text-gray-400 text-sm font-medium">Camera off</p>
                    <button
                      onClick={testDevices}
                      className="px-5 py-2 bg-white text-gray-900 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Test Camera & Mic
                    </button>
                  </div>
                )}
                {stream && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white text-xs font-semibold">System Ready</span>
                    </div>
                    <button
                      onClick={() => { stream.getTracks().forEach(t => t.stop()); setStream(null); setCamOk(false) }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Off
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Strategy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Lesson Plan</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Set goals for today&apos;s session</p>
                </div>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : saveMsg ?? 'Save'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Main Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Discussing future plans, Travel vocabulary..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Key Objectives</label>
                  <textarea
                    value={prepNotes}
                    onChange={e => setPrepNotes(e.target.value)}
                    rows={4}
                    placeholder="List vocab, grammar focus points, or exercises..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Launch CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-4">
                {isLive ? '🚀' : '⏳'}
              </div>
              <h2 className="font-bold text-gray-900 mb-1">
                {isLive ? 'Ready to teach?' : 'Class window'}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {isLive
                  ? 'The classroom is open. Launch when prepared.'
                  : 'You can enter early to set up.'}
              </p>
              <button
                onClick={handleStartClass}
                disabled={starting}
                className="w-full py-3 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold rounded-xl shadow-md shadow-purple-200 transition-colors active:scale-95 disabled:opacity-50"
              >
                {starting ? 'Starting...' : 'Launch Classroom'}
              </button>
            </div>

            {/* Students */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled Students</h2>
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-lg">{students.length}</span>
              </div>
              <div className="space-y-3">
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">Student</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No students enrolled yet</p>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Pre-Class Checklist</h2>
              <ul className="space-y-2.5">
                {[
                  'Stable high-speed WiFi',
                  'Phone & notifications silenced',
                  'Good lighting & camera angle',
                  'Water nearby',
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BayyanLogo } from '@/components/BayyanLogo'
import { useRouter } from 'next/navigation'
import { VideoCallRoom } from '@/components/VideoCallRoom'
import { savePreCallNotes } from '@/lib/teacher/session-actions'

type Student = {
  id: string
  name: string
  avatarUrl?: string | null
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
  userAvatarUrl?: string | null
  students: Student[]
  weekNumber: number
  sessionNumber: number
  totalSessions: number
  existingTopic?: string
  existingPrepNotes?: string
}

const CHECKLIST_TIPS = [
  'Stable high-speed WiFi',
  'Phone & notifications silenced',
  'Good lighting & camera angle',
  'Water nearby',
]

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c4ff5] to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
      {name.charAt(0)}
    </div>
  )
}

function MicMeter({ stream }: { stream: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    function draw() {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      const level = Math.min(avg / 80, 1)

      const canvas = canvasRef.current
      if (!canvas) return
      const c = canvas.getContext('2d')!
      c.clearRect(0, 0, canvas.width, canvas.height)

      const bars = 20
      const barW = (canvas.width - (bars - 1) * 3) / bars
      for (let i = 0; i < bars; i++) {
        const filled = i / bars < level
        c.fillStyle = filled
          ? i < 14 ? '#22c55e' : i < 17 ? '#f59e0b' : '#ef4444'
          : 'rgba(255,255,255,0.18)'
        const x = i * (barW + 3)
        const h = filled ? canvas.height : canvas.height * 0.3
        c.beginPath()
        c.roundRect(x, (canvas.height - h) / 2, barW, h, 2)
        c.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ctx.close().catch(() => {})
    }
  }, [stream])

  return <canvas ref={canvasRef} width={240} height={24} className="w-full h-6" />
}

function DeviceStatus({ label, ok, idle, hint }: { label: string; ok: boolean; idle: boolean; hint?: string }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
      ok ? 'border-green-200 bg-green-50' : idle ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50'
    }`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
        ok ? 'bg-green-500 text-white' : idle ? 'bg-gray-200 text-gray-400' : 'bg-amber-400 text-white'
      }`}>
        {ok ? '✓' : idle ? '•' : '…'}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 leading-tight">
          {ok ? 'Working' : idle ? 'Not tested' : hint ?? 'Waiting…'}
        </p>
      </div>
    </div>
  )
}

export function TeacherLobby(props: LobbyProps) {
  const {
    sessionId, roomToken, courseName, language, level,
    scheduledAt, userId, userName, userAvatarUrl, students,
    weekNumber, sessionNumber, totalSessions,
    existingTopic, existingPrepNotes,
  } = props

  const [inCall, setInCall] = useState(false)
  const [topic, setTopic] = useState(existingTopic ?? '')
  const [prepNotes, setPrepNotes] = useState(existingPrepNotes ?? '')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [camOk, setCamOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [testing, setTesting] = useState(false)
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [saving, startSave] = useTransition()
  const [starting, startStart] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  function teardownStream(s: MediaStream | null) {
    s?.getTracks().forEach(t => t.stop())
  }

  useEffect(() => {
    return () => { teardownStream(stream) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream])

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  async function testDevices() {
    setTesting(true); setDeviceError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s)
      setCamOk(s.getVideoTracks().length > 0)
      setMicOk(s.getAudioTracks().length > 0)
    } catch {
      // video failed — try audio only so mic can still be verified
      try {
        const a = await navigator.mediaDevices.getUserMedia({ audio: true })
        setStream(a)
        setCamOk(false)
        setMicOk(a.getAudioTracks().length > 0)
        setDeviceError('Camera unavailable — mic only')
      } catch {
        setDeviceError('Camera & mic blocked. Allow access in browser.')
      }
    } finally {
      setTesting(false)
    }
  }

  function turnOff() {
    teardownStream(stream)
    setStream(null); setCamOk(false); setMicOk(false)
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
      teardownStream(stream)
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
            <BayyanLogo size={24} />
            <span className="hidden sm:inline text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Teacher Lobby</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={userName} url={userAvatarUrl} />
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Camera &amp; Mic Check</h2>
                {stream && (
                  <button
                    onClick={turnOff}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Stop test
                  </button>
                )}
              </div>

              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                {stream && camOk ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📷</div>
                    <p className="text-gray-400 text-sm font-medium">
                      {stream && !camOk ? 'No camera signal' : 'Camera off'}
                    </p>
                    {!stream && (
                      <button
                        onClick={testDevices}
                        disabled={testing}
                        className="px-5 py-2 bg-white text-gray-900 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60"
                      >
                        {testing ? 'Starting…' : 'Test Camera & Mic'}
                      </button>
                    )}
                  </div>
                )}

                {/* live camera badge */}
                {stream && camOk && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-[11px] font-semibold">LIVE</span>
                  </div>
                )}

                {/* mic level meter overlay */}
                {stream && micOk && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-lg">
                    <span className="text-white text-sm">🎙️</span>
                    <div className="flex-1">
                      <MicMeter stream={stream} />
                    </div>
                  </div>
                )}
              </div>

              {deviceError && (
                <p className="text-xs text-amber-600 font-medium mt-3">{deviceError}</p>
              )}

              {/* real device status — ticks only when actually working */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <DeviceStatus label="Camera" ok={camOk} idle={!stream} />
                <DeviceStatus label="Microphone" ok={micOk} idle={!stream} hint={stream && !micOk ? 'Speak to test' : undefined} />
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
                    {s.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.avatarUrl} alt={s.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                    )}
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
              <ul className="space-y-1">
                {CHECKLIST_TIPS.map(tip => {
                  const done = checklist[tip]
                  return (
                    <li key={tip}>
                      <button
                        onClick={() => setChecklist(c => ({ ...c, [tip]: !c[tip] }))}
                        className="w-full flex items-center gap-2.5 text-sm text-left py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
                          done ? 'bg-green-500 text-white' : 'border-2 border-gray-200 text-transparent'
                        }`}>✓</span>
                        <span className={done ? 'text-gray-400 line-through' : 'text-gray-600'}>{tip}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

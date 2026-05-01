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
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
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
      setSaveMsg(res.error ? `Error: ${res.error}` : 'Saved ✓')
      setTimeout(() => setSaveMsg(null), 2000)
    })
  }

  function handleStartClass() {
    startStart(async () => {
      // Stop preview stream before entering call (VideoCallRoom will re-acquire)
      stream?.getTracks().forEach(t => t.stop())
      setStream(null)
      setInCall(true)
    })
  }

  const formattedTime = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline text-sm font-medium text-gray-600">Pre-class Lobby</span>
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Session time!
            </span>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid lg:grid-cols-3 gap-6 xl:gap-8">

          {/* ── Left (2 cols): prep + notes ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Session info banner */}
            <div className="bg-gradient-to-r from-[#6c4ff5] to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">Upcoming class</p>
                  <h1 className="text-xl font-bold">{courseName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full">{language}</span>
                    <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize">{level}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-purple-200 text-xs">Scheduled for</p>
                  <p className="text-white font-semibold text-sm mt-0.5">{formattedTime}</p>
                </div>
              </div>
            </div>

            {/* Topic + prep */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📝</span>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">Session prep</h2>
                    <p className="text-xs text-gray-400">Set a topic and notes visible only to you</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="text-xs font-semibold text-[#6c4ff5] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : saveMsg ?? 'Save draft'}
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Today&apos;s topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Past tense conjugation, travel vocabulary…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prep notes</label>
                  <textarea
                    value={prepNotes}
                    onChange={e => setPrepNotes(e.target.value)}
                    rows={4}
                    placeholder="Exercises to cover, vocab lists, things to check from last session…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Device check */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <span className="text-xl">📹</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Device check</h2>
                  <p className="text-xs text-gray-400">Verify camera & mic before starting</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                    {stream ? (
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <p className="text-3xl mb-2">📷</p>
                        <p className="text-xs">Preview here</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${camOk ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100'}`}>
                        <span className="text-xl">{camOk ? '✅' : '📷'}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Camera</p>
                          <p className={`text-xs ${camOk ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>{camOk ? 'Working' : 'Not tested'}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${micOk ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100'}`}>
                        <span className="text-xl">{micOk ? '✅' : '🎤'}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Microphone</p>
                          <p className={`text-xs ${micOk ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>{micOk ? 'Working' : 'Not tested'}</p>
                        </div>
                      </div>
                    </div>
                    {!stream ? (
                      <button type="button" onClick={testDevices}
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Test devices
                      </button>
                    ) : (
                      <button type="button" onClick={() => { stream.getTracks().forEach(t => t.stop()); setStream(null); setCamOk(false); setMicOk(false) }}
                        className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                        Stop preview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right (1 col): students + start ── */}
          <div className="space-y-5">
            {/* Start class CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl ${
                isLive ? 'bg-emerald-50' : 'bg-gray-50'
              }`}>
                {isLive ? '🟢' : '⏳'}
              </div>
              <h2 className="font-bold text-gray-900 text-base mb-1">
                {isLive ? 'Ready to start!' : 'Not yet time'}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {isLive
                  ? 'Your session time has arrived. Students are waiting.'
                  : `Session starts at ${new Date(scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
              </p>
              <button
                type="button"
                onClick={handleStartClass}
                disabled={starting}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all shadow-lg ${
                  isLive
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                    : 'bg-[#6c4ff5] text-white hover:bg-[#5c3de8] shadow-purple-200'
                } disabled:opacity-50`}
              >
                {starting ? 'Starting…' : isLive ? '▶ Start Class' : '▶ Enter Early'}
              </button>
              <p className="text-xs text-gray-400 mt-3">Students join from their session link.</p>
            </div>

            {/* Student list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-sm">
                  Students
                  <span className="ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {students.length}
                  </span>
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No students assigned yet</p>
                ) : students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={s.name} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">Student</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-50 rounded-2xl p-5">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Before you start</p>
              <ul className="space-y-2">
                {[
                  '✅ Set today\'s topic above',
                  '✅ Check camera & mic',
                  '✅ Close unnecessary tabs',
                  '✅ Stable internet connection',
                ].map((tip, i) => (
                  <li key={i} className="text-sm text-purple-700">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

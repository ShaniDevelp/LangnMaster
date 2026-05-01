'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { saveTeacherOnboarding } from '@/lib/teacher/actions'

// ── Data ─────────────────────────────────────────────────────────────────────

const TIMEZONES = [
  { label: 'UTC-8  Pacific (US & Canada)',       value: 'America/Los_Angeles' },
  { label: 'UTC-7  Mountain (US & Canada)',      value: 'America/Denver' },
  { label: 'UTC-6  Central (US & Canada)',       value: 'America/Chicago' },
  { label: 'UTC-5  Eastern (US & Canada)',       value: 'America/New_York' },
  { label: 'UTC-3  Buenos Aires / São Paulo',    value: 'America/Argentina/Buenos_Aires' },
  { label: 'UTC+0  London / Lisbon (GMT)',       value: 'Europe/London' },
  { label: 'UTC+1  Paris / Berlin / Madrid',     value: 'Europe/Paris' },
  { label: 'UTC+2  Cairo / Athens / Helsinki',   value: 'Europe/Helsinki' },
  { label: 'UTC+3  Moscow / Nairobi / Riyadh',   value: 'Europe/Moscow' },
  { label: 'UTC+4  Dubai / Baku',                value: 'Asia/Dubai' },
  { label: 'UTC+5  Karachi / Tashkent',          value: 'Asia/Karachi' },
  { label: 'UTC+5:30  Mumbai / Delhi',           value: 'Asia/Kolkata' },
  { label: 'UTC+6  Dhaka / Almaty',              value: 'Asia/Dhaka' },
  { label: 'UTC+7  Bangkok / Jakarta / Hanoi',   value: 'Asia/Bangkok' },
  { label: 'UTC+8  Beijing / Singapore / Perth', value: 'Asia/Singapore' },
  { label: 'UTC+9  Tokyo / Seoul',               value: 'Asia/Tokyo' },
  { label: 'UTC+10  Sydney / Melbourne',         value: 'Australia/Sydney' },
  { label: 'UTC+12  Auckland / Fiji',            value: 'Pacific/Auckland' },
]

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Morning', 'Afternoon', 'Evening']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const DURATIONS = [
  { key: '45', label: '45 min', desc: 'Focused, efficient' },
  { key: '60', label: '60 min', desc: 'Standard — recommended' },
  { key: '90', label: '90 min', desc: 'Deep-dive sessions' },
]

const STEPS = [
  { id: 0, icon: '📅', label: 'Schedule',    title: 'When can you teach?',          sub: 'Set your timezone and recurring weekly slots — admin schedules groups around this.' },
  { id: 1, icon: '🎯', label: 'Preferences', title: 'How do you like to teach?',    sub: 'Help us match you with the right students and session format.' },
  { id: 2, icon: '📹', label: 'Device check', title: 'Camera & microphone check',   sub: 'Make sure your setup is ready before your first live session.' },
  { id: 3, icon: '🎉', label: 'Done!',        title: "You're all set!",              sub: "Your profile is complete. Here's what happens next." },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeacherOnboardingPage() {
  const [step, setStep] = useState(0)

  // Step 0
  const [timezone, setTimezone] = useState('')
  const [availability, setAvailability] = useState<string[]>([])

  // Step 1
  const [preferredLevels, setPreferredLevels] = useState<string[]>([])
  const [preferredDuration, setPreferredDuration] = useState('60')

  // Step 2 — device check
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [stream])

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  function toggleSlot(day: string, slot: string) {
    const key = `${day.toLowerCase()}-${slot.toLowerCase()}`
    setAvailability(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  function toggleLevel(level: string) {
    setPreferredLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])
  }
  async function testDevices() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s); setCameraOk(true); setMicOk(true)
    } catch {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }); setMicOk(true) } catch { /* denied */ }
    }
  }

  function canAdvance(): boolean {
    if (step === 0) return !!timezone && availability.length >= 1
    if (step === 1) return preferredLevels.length > 0
    return true
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }
  function handleFinish() {
    setError(null)
    startTransition(async () => {
      const result = await saveTeacherOnboarding({
        timezone, availability,
        preferences: { preferredLevels, preferredDuration },
      })
      if (result && 'error' in result) setError(result.error)
    })
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#6c4ff5]">LangMaster</Link>
          <span className="text-sm text-gray-400">Teacher Onboarding · Step {step + 1} of {STEPS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-[#6c4ff5] transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 xl:gap-16">

          {/* ── Left sidebar: step navigator ── */}
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Steps</p>
              {STEPS.map(s => {
                const isDone    = s.id < step
                const isCurrent = s.id === step
                return (
                  <div key={s.id} className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
                    isCurrent ? 'bg-[#6c4ff5] text-white shadow-lg shadow-purple-200' :
                    isDone    ? 'bg-emerald-50 text-emerald-700' :
                    'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                      isCurrent ? 'bg-white/20' : isDone ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      {isDone ? '✓' : s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : isDone ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {s.label}
                      </p>
                      {isCurrent && <p className="text-xs text-white/70 truncate mt-0.5">In progress</p>}
                      {isDone    && <p className="text-xs text-emerald-500 mt-0.5">Complete</p>}
                    </div>
                  </div>
                )
              })}

              {/* Tip card */}
              <div className="mt-6 bg-purple-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Tip</p>
                <p className="text-sm text-purple-700 leading-relaxed">
                  {step === 0 && 'Pick every slot you\'re available — more slots means better group matching.'}
                  {step === 1 && 'You can be assigned groups outside your preferences if there\'s high demand.'}
                  {step === 2 && 'Use Chrome or Edge for the best WebRTC camera experience.'}
                  {step === 3 && 'Check your email — we\'ll notify you as soon as a group is assigned.'}
                </p>
              </div>
            </div>
          </aside>

          {/* ── Right: step content ── */}
          <main>
            {/* Step header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#6c4ff5] bg-purple-50 px-3 py-1.5 rounded-full mb-3">
                <span>{STEPS[step].icon}</span>
                <span>Step {step + 1} — {STEPS[step].label}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{STEPS[step].title}</h1>
              <p className="text-gray-500 mt-1.5 text-base">{STEPS[step].sub}</p>
            </div>

            {/* ── Step 0: Timezone + Availability ── */}
            {step === 0 && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your timezone <span className="text-red-500">*</span>
                  </label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full sm:max-w-sm px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white">
                    <option value="" disabled>Select your timezone…</option>
                    {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Weekly availability <span className="text-red-500">*</span>
                    </label>
                    {availability.length > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {availability.length} slot{availability.length !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-5">Morning = 6am–12pm · Afternoon = 12pm–6pm · Evening = 6pm–11pm (your timezone)</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="w-28" />
                          {DAYS.map(d => (
                            <th key={d} className="pb-3 text-xs font-semibold text-gray-500 text-center min-w-[48px]">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SLOTS.map(slot => (
                          <tr key={slot}>
                            <td className="pr-4 py-2 text-sm text-gray-500 font-medium whitespace-nowrap">{slot}</td>
                            {DAYS.map(day => {
                              const key = `${day.toLowerCase()}-${slot.toLowerCase()}`
                              const active = availability.includes(key)
                              return (
                                <td key={day} className="py-2 px-1 text-center">
                                  <button type="button" onClick={() => toggleSlot(day, slot)}
                                    aria-label={`${day} ${slot}`} aria-pressed={active}
                                    className={`w-10 h-10 rounded-xl text-xs font-semibold transition-all ${
                                      active ? 'bg-[#6c4ff5] text-white shadow-md shadow-purple-200'
                                             : 'bg-gray-100 text-gray-400 hover:bg-purple-100 hover:text-[#6c4ff5]'
                                    }`}>
                                    {active ? '✓' : ''}
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Teaching preferences ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preferred student levels <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-400 mb-4">You can be assigned groups outside these levels when demand is high.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {LEVELS.map(level => {
                      const sel = preferredLevels.includes(level)
                      return (
                        <button key={level} type="button" onClick={() => toggleLevel(level)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                            sel ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                          }`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            sel ? 'border-[#6c4ff5] bg-[#6c4ff5]' : 'border-gray-300'
                          }`}>
                            {sel && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm capitalize ${sel ? 'text-[#6c4ff5]' : 'text-gray-700'}`}>{level}</p>
                            <p className="text-xs text-gray-400">
                              {level === 'beginner' ? 'A1–A2 students' : level === 'intermediate' ? 'B1–B2 students' : 'C1–C2 students'}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Preferred session duration</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DURATIONS.map(d => (
                      <button key={d.key} type="button" onClick={() => setPreferredDuration(d.key)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                          preferredDuration === d.key ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                        }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          preferredDuration === d.key ? 'border-[#6c4ff5] bg-[#6c4ff5]' : 'border-gray-300'
                        }`}>
                          {preferredDuration === d.key && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${preferredDuration === d.key ? 'text-[#6c4ff5]' : 'text-gray-700'}`}>{d.label}</p>
                          <p className="text-xs text-gray-400">{d.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Device check ── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Camera + status side by side on desktop */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Camera preview */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-900 aspect-video flex items-center justify-center">
                      {stream ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                          <span className="text-5xl">📹</span>
                          <p className="text-sm">Camera preview appears here</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex gap-3">
                      {!stream ? (
                        <button type="button" onClick={testDevices}
                          className="flex-1 py-3 rounded-xl bg-[#6c4ff5] text-white font-semibold text-sm hover:bg-[#5c3de8] transition-colors">
                          Test camera & microphone
                        </button>
                      ) : (
                        <button type="button" onClick={() => { stream.getTracks().forEach(t => t.stop()); setStream(null); setCameraOk(false); setMicOk(false) }}
                          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                          Stop preview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Device status + tips */}
                  <div className="space-y-4">
                    {/* Status cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-4 rounded-2xl border-2 text-center ${cameraOk ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                        <span className="text-2xl block mb-1.5">{cameraOk ? '✅' : '📷'}</span>
                        <p className="text-sm font-semibold text-gray-700">Camera</p>
                        <p className={`text-xs mt-0.5 font-medium ${cameraOk ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {cameraOk ? 'Working' : 'Not tested'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-2xl border-2 text-center ${micOk ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                        <span className="text-2xl block mb-1.5">{micOk ? '✅' : '🎤'}</span>
                        <p className="text-sm font-semibold text-gray-700">Microphone</p>
                        <p className={`text-xs mt-0.5 font-medium ${micOk ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {micOk ? 'Working' : 'Not tested'}
                        </p>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-2xl p-5 space-y-2.5">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Device tips</p>
                      {[
                        '💡 Use Chrome or Edge for best performance',
                        '🎧 A headset reduces echo for students',
                        '💡 Good lighting = better video quality',
                        '📶 Wired internet is more stable than WiFi',
                      ].map((t, i) => (
                        <p key={i} className="text-sm text-blue-700">{t}</p>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      You can skip this step and test again before your first session from the pre-call lobby.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: All set ── */}
            {step === 3 && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: celebration */}
                <div className="bg-gradient-to-br from-[#6c4ff5] to-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">Welcome aboard!</h2>
                    <p className="text-purple-100 text-sm leading-relaxed">
                      Your profile is complete. The admin will review your availability and assign your first group of 2 students. We&apos;ll notify you by email as soon as it&apos;s ready.
                    </p>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="text-xl">⭐</span>
                      <p>Students rate sessions — build your reputation from day one!</p>
                    </div>
                  </div>
                </div>

                {/* Right: what's next */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">What happens next</p>
                  <div className="space-y-5">
                    {[
                      { icon: '👥', title: 'Group assignment', desc: 'Admin matches you with 2 students based on your availability and their level.' },
                      { icon: '📧', title: 'Email notification', desc: 'You\'ll get an email as soon as your group is confirmed.' },
                      { icon: '📅', title: 'Sessions scheduled', desc: 'Sessions appear in your dashboard — typically starting the next Monday.' },
                      { icon: '🎥', title: 'Join from dashboard', desc: 'Click "Start Class" from your dashboard when a session goes live.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
              {step > 0 && step < STEPS.length - 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 && (
                <button type="button" onClick={handleNext} disabled={!canAdvance()}
                  className="px-10 py-3.5 rounded-xl bg-[#6c4ff5] text-white font-bold text-sm hover:bg-[#5c3de8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-200">
                  Continue →
                </button>
              )}
              {step === STEPS.length - 1 && (
                <button type="button" onClick={handleFinish} disabled={isPending}
                  className="px-10 py-3.5 rounded-xl bg-[#6c4ff5] text-white font-bold text-sm hover:bg-[#5c3de8] transition-colors disabled:opacity-40 shadow-lg shadow-purple-200">
                  {isPending ? 'Setting up your dashboard…' : 'Go to my dashboard →'}
                </button>
              )}

              {/* Dot indicator on mobile */}
              <div className="flex items-center gap-1.5 ml-auto lg:hidden">
                {STEPS.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all ${
                    i === step ? 'w-5 h-2 bg-[#6c4ff5]' : i < step ? 'w-2 h-2 bg-purple-300' : 'w-2 h-2 bg-gray-200'
                  }`} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

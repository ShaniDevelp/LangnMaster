'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { saveTeacherOnboarding } from '@/lib/teacher/actions'
import { AvailabilityPicker } from '@/components/AvailabilityPicker'
import { useRouter } from 'next/navigation'

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

const TEACH_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
]

const LEVELS = ['beginner', 'intermediate', 'advanced']
const DURATIONS = [
  { key: '45', label: '45 min', desc: 'Focused, efficient' },
  { key: '60', label: '60 min', desc: 'Standard — recommended' },
  { key: '90', label: '90 min', desc: 'Deep-dive sessions' },
]

const STEPS = [
  { title: 'When can you teach?', sub: 'Set your timezone and recurring weekly slots' },
  { title: 'Teaching preferences', sub: 'Help us match you with the right students' },
  { title: 'Device check', sub: 'Ensure your camera & microphone are working' },
  { title: "You're all set!", sub: 'Your profile is ready to go.' },
]

export default function TeacherOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 to 3

  // Step 0
  const [timezone, setTimezone] = useState('')
  const [availability, setAvailability] = useState<string[]>([])

  // Step 1
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(['English'])
  const [preferredLevels, setPreferredLevels] = useState<string[]>([])
  const [preferredDuration, setPreferredDuration] = useState('60')

  // Step 2
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
    if (step === 1) return languagesTaught.length > 0 && preferredLevels.length > 0
    if (step === 2) return true // Device check is skippable technically, but nice to have
    if (step === 3) return true
    return false
  }

  function handleNext() {
    if (step < 3) { setStep(s => s + 1); return }
    setError(null)
    startTransition(async () => {
      const result = await saveTeacherOnboarding({
        timezone,
        availability,
        languagesTaught,
        preferences: {
          preferredLevels,
          preferredDuration
        }
      })
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        router.push('/teacher/dashboard')
      }
    })
  }

  const progress = ((step + 1) / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-2xl mx-auto w-full">
        <Link href="/" className="text-lg font-bold text-brand-500">LangMaster</Link>
        <span className="text-sm text-gray-400">Step {step + 1} of 4</span>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-100 h-1">
        <div className="bg-brand-500 h-1 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm font-semibold text-brand-500 uppercase tracking-wider mb-1">
              Step {step + 1} — {STEPS[step].title}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{STEPS[step].title}</h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">{STEPS[step].sub}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
            
            {/* Step 0: Schedule */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="max-w-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your timezone <span className="text-red-500">*</span></label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white">
                    <option value="" disabled>Select your timezone…</option>
                    {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Weekly slots <span className="text-red-500">*</span></label>
                    {availability.length > 0 && (
                      <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">
                        {availability.length} slot{availability.length !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-5">
                    Click a period to select all hours. Use ▼ to fine-tune individual hours.
                    Times shown in your timezone · stored in UTC.
                  </p>
                  {timezone ? (
                    <AvailabilityPicker
                      utcSlots={availability}
                      timezone={timezone}
                      onChange={setAvailability}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-5 text-center text-sm text-gray-400">
                      Select your timezone above first.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Preferences */}
            {step === 1 && (
              <div className="space-y-8">

                {/* Languages you teach */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Languages you teach <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-3">Currently only English is available for teaching.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* English — active */}
                    <button
                      type="button"
                      onClick={() => setLanguagesTaught(prev =>
                        prev.includes('English') ? prev.filter(l => l !== 'English') : [...prev, 'English']
                      )}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                        languagesTaught.includes('English')
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                      }`}
                    >
                      {languagesTaught.includes('English') ? '✓ ' : ''}English
                    </button>
                    {/* Others — disabled */}
                    {TEACH_LANGUAGES.filter(l => l !== 'English').slice(0, 5).map(l => (
                      <button
                        key={l}
                        type="button"
                        disabled
                        className="px-3 py-2.5 rounded-xl text-sm font-medium border bg-gray-50/50 text-gray-400 border-gray-100 cursor-not-allowed text-left"
                      >
                        <span>{l}</span>
                        <span className="text-[10px] block font-normal text-gray-400 mt-0.5">will come in future</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred student levels <span className="text-red-500">*</span></label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {LEVELS.map(level => {
                      const active = preferredLevels.includes(level)
                      return (
                        <button key={level} type="button" onClick={() => toggleLevel(level)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            active ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
                          }`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center mb-2 ${active ? 'bg-brand-500 text-white' : 'bg-gray-200'}`}>
                            {active ? '✓' : ''}
                          </div>
                          <p className={`font-bold capitalize ${active ? 'text-brand-700' : 'text-gray-900'}`}>{level}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Standard session duration <span className="text-red-500">*</span></label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {DURATIONS.map(d => {
                      const active = preferredDuration === d.key
                      return (
                        <button key={d.key} type="button" onClick={() => setPreferredDuration(d.key)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            active ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
                          }`}>
                          <div className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center ${
                            active ? 'border-brand-500' : 'border-gray-300'
                          }`}>
                            {active && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                          </div>
                          <p className={`font-bold ${active ? 'text-brand-700' : 'text-gray-900'}`}>{d.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{d.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Device check */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative shadow-inner">
                  {stream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">📹</div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${cameraOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
                      {cameraOk ? '✓ Camera OK' : 'Camera pending'}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${micOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
                      {micOk ? '✓ Mic OK' : 'Mic pending'}
                    </span>
                  </div>
                </div>

                {!stream && (
                  <button type="button" onClick={testDevices}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold text-sm hover:bg-gray-200 transition-colors">
                    Test Camera & Microphone
                  </button>
                )}
                {stream && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <p className="text-sm font-semibold text-emerald-700">Looking good!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Your devices are working perfectly.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Done */}
            {step === 3 && (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6">
                  🎉
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're ready to teach!</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Your profile is fully set up. Click finish to go to your dashboard, where you'll see your schedule and incoming groups.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={isPending}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || isPending}
              className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : step < 3 ? 'Continue →' : 'Go to Dashboard →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

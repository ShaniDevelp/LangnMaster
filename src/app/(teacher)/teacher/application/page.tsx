'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BayyanLogo } from '@/components/BayyanLogo'
import { submitApplication } from '@/lib/teacher/actions'
import { AvailabilityPicker } from '@/components/AvailabilityPicker'
import { AvatarUpload } from '@/components/AvatarUpload'

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
  'Dutch', 'Polish', 'Turkish', 'Vietnamese', 'Thai', 'Swahili',
]

const PROFICIENCY_LEVELS = [
  { key: 'native',     label: 'Native',      desc: 'Grew up speaking it' },
  { key: 'near_native', label: 'Near-native', desc: 'C2 level' },
  { key: 'fluent',    label: 'Fluent',       desc: 'C1 level' },
]

const CERTIFICATIONS = [
  'TEFL', 'CELTA', 'DELTA', 'TESOL', 'DELF/DALF', 'DELE',
  'HSK Instructor', 'JLPT Instructor', 'Cambridge TKT', 'MA in Education',
]

const TIMEZONES = [
  { label: 'UTC-8  Pacific (US & Canada)',       value: 'America/Los_Angeles',              country: 'United States' },
  { label: 'UTC-7  Mountain (US & Canada)',      value: 'America/Denver',                   country: 'United States' },
  { label: 'UTC-6  Central (US & Canada)',       value: 'America/Chicago',                  country: 'United States' },
  { label: 'UTC-5  Eastern (US & Canada)',       value: 'America/New_York',                 country: 'United States' },
  { label: 'UTC-3  Buenos Aires / São Paulo',    value: 'America/Argentina/Buenos_Aires',   country: 'Argentina' },
  { label: 'UTC+0  London / Lisbon (GMT)',       value: 'Europe/London',                    country: 'United Kingdom' },
  { label: 'UTC+1  Paris / Berlin / Madrid',     value: 'Europe/Paris',                     country: 'France' },
  { label: 'UTC+2  Cairo / Athens / Helsinki',   value: 'Europe/Helsinki',                  country: 'Finland' },
  { label: 'UTC+3  Moscow / Nairobi / Riyadh',   value: 'Europe/Moscow',                    country: 'Russia' },
  { label: 'UTC+4  Dubai / Baku',                value: 'Asia/Dubai',                       country: 'UAE' },
  { label: 'UTC+5  Karachi / Tashkent',          value: 'Asia/Karachi',                     country: 'Pakistan' },
  { label: 'UTC+5:30  Mumbai / Delhi',           value: 'Asia/Kolkata',                     country: 'India' },
  { label: 'UTC+6  Dhaka / Almaty',              value: 'Asia/Dhaka',                       country: 'Bangladesh' },
  { label: 'UTC+7  Bangkok / Jakarta / Hanoi',   value: 'Asia/Bangkok',                     country: 'Thailand' },
  { label: 'UTC+8  Beijing / Singapore / Perth', value: 'Asia/Singapore',                   country: 'Singapore' },
  { label: 'UTC+9  Tokyo / Seoul',               value: 'Asia/Tokyo',                       country: 'Japan' },
  { label: 'UTC+10  Sydney / Melbourne',         value: 'Australia/Sydney',                 country: 'Australia' },
  { label: 'UTC+12  Auckland / Fiji',            value: 'Pacific/Auckland',                 country: 'New Zealand' },
]

const LEVELS = ['beginner', 'intermediate', 'advanced']
const DURATIONS = [
  { key: '45', label: '45 min', desc: 'Focused, efficient' },
  { key: '60', label: '60 min', desc: 'Standard — recommended' },
  { key: '90', label: '90 min', desc: 'Deep-dive sessions' },
]

const STEP_TITLES = [
  'Languages',
  'Certifications',
  'Schedule',
  'About You',
  'Complete profile',
  'Device check',
]

const LAST_STEP = STEP_TITLES.length - 1 // 5

export default function TeacherApplicationPage() {
  const [step, setStep] = useState(0) // 0 to LAST_STEP

  // Step 0
  const [languagesTaught, setLanguagesTaught] = useState<{ lang: string; proficiency: string }[]>([])

  // Step 1
  const [certifications, setCertifications] = useState<string[]>([])
  const [customCert, setCustomCert] = useState('')

  // Step 2
  const [timezone, setTimezone] = useState('')
  const [autoDetectedTz, setAutoDetectedTz] = useState<string | null>(null)
  const [availability, setAvailability] = useState<string[]>([])

  // Step 3
  const [introVideoUrl, setIntroVideoUrl] = useState('')
  const [teachingBio, setTeachingBio] = useState('')

  // Step 4 — complete profile (photo, experience, teaching preferences)
  const [yearsExperience, setYearsExperience] = useState('')
  const [preferredLevels, setPreferredLevels] = useState<string[]>([])
  const [preferredDuration, setPreferredDuration] = useState('60')

  // Step 5 — device check
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Auto-detect the teacher's timezone on mount (same UX as student onboarding).
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = TIMEZONES.find(tz => tz.value === detected)
    if (match) {
      setTimezone(match.value)
      setAutoDetectedTz(match.value)
    } else {
      // Fallback: match by UTC offset
      const offset = -new Date().getTimezoneOffset()
      const hours = Math.floor(Math.abs(offset) / 60)
      const mins = Math.abs(offset) % 60
      const sign = offset >= 0 ? '+' : '-'
      const offsetStr = `UTC${sign}${hours}${mins ? `:${mins}` : ''}`
      const fallback = TIMEZONES.find(tz => tz.label.startsWith(offsetStr))
      if (fallback) {
        setTimezone(fallback.value)
        setAutoDetectedTz(fallback.value)
      }
    }
  }, [])

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

  function toggleLanguage(lang: string) {
    setLanguagesTaught(prev => {
      if (prev.find(l => l.lang === lang)) return prev.filter(l => l.lang !== lang)
      return [...prev, { lang, proficiency: 'native' }]
    })
  }

  function setProficiency(lang: string, proficiency: string) {
    setLanguagesTaught(prev => prev.map(l => l.lang === lang ? { ...l, proficiency } : l))
  }

  function toggleCert(cert: string) {
    setCertifications(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])
  }

  function addCustomCert() {
    const t = customCert.trim()
    if (t && !certifications.includes(t)) { setCertifications(prev => [...prev, t]); setCustomCert('') }
  }

  function canAdvance(): boolean {
    if (step === 0) return languagesTaught.length > 0
    if (step === 1) return true // Certifications are optional
    if (step === 2) return !!timezone && availability.length >= 2
    if (step === 3) return teachingBio.trim().length >= 50
    if (step === 4) return yearsExperience.trim() !== '' && Number(yearsExperience) >= 0 && preferredLevels.length > 0
    if (step === 5) return true // Device check is skippable
    return false
  }

  function handleNext() {
    if (step < LAST_STEP) { setStep(s => s + 1); return }
    setError(null)
    startTransition(async () => {
      const result = await submitApplication({
        languagesTaught,
        certifications,
        introVideoUrl,
        teachingBio,
        availability,
        timezone,
        yearsExperience,
        preferredLevels,
        preferredDuration,
      })
      if (result && 'error' in result) setError(result.error)
    })
  }

  const progress = ((step + 1) / STEP_TITLES.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-2xl mx-auto w-full">
        <Link href="/"><BayyanLogo size={28} /></Link>
        <span className="text-sm text-gray-400">Step {step + 1} of {STEP_TITLES.length}</span>
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
              Step {step + 1} — {STEP_TITLES[step]}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {step === 0 && 'What languages do you teach?'}
              {step === 1 && 'Teaching certifications'}
              {step === 2 && 'Set your schedule'}
              {step === 3 && 'About you'}
              {step === 4 && 'Complete your profile'}
              {step === 5 && 'Check your devices'}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              {step === 0 && 'Select the language you teach and your proficiency level'}
              {step === 1 && 'Optional, but helps show your qualifications to students'}
              {step === 2 && 'When can you teach? Admin schedules groups around these slots'}
              {step === 3 && 'Students will see your bio and video'}
              {step === 4 && 'Add a photo, your experience, and teaching preferences students will see'}
              {step === 5 && 'Make sure your camera & microphone work before you teach'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
            
            {/* Step 0: Languages */}
            {step === 0 && (
              <div className="space-y-6">
                <p className="text-xs text-gray-400 -mt-2">Currently only English is available for teaching.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* English — active */}
                  {(() => {
                    const sel = languagesTaught.find(l => l.lang === 'English')
                    return (
                      <button type="button" onClick={() => toggleLanguage('English')}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                          sel ? 'bg-brand-500 text-white border-brand-500'
                              : 'bg-white text-gray-700 border-gray-100 hover:border-brand-300 hover:text-brand-500'
                        }`}>
                        {sel && '✓ '}English
                      </button>
                    )
                  })()}
                  {/* Others — disabled */}
                  {LANGUAGES.filter(l => l !== 'English').slice(0, 5).map(lang => (
                    <button key={lang} type="button" disabled
                      className="px-3 py-2.5 rounded-xl text-sm font-medium border-2 bg-gray-50/50 text-gray-400 border-gray-100 cursor-not-allowed text-left">
                      <span>{lang}</span>
                      <span className="text-[10px] block font-normal text-gray-400 mt-0.5">will come in future</span>
                    </button>
                  ))}
                </div>

                {languagesTaught.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Proficiency for each</p>
                    <div className="space-y-4">
                      {languagesTaught.map(({ lang, proficiency }) => (
                        <div key={lang} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <span className="text-sm font-semibold text-gray-800 sm:w-28 flex-shrink-0">{lang}</span>
                          <div className="flex gap-2 flex-wrap">
                            {PROFICIENCY_LEVELS.map(p => (
                              <button key={p.key} type="button" onClick={() => setProficiency(lang, p.key)}
                                title={p.desc}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                                  proficiency === p.key
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                                }`}>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Certifications */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(cert => (
                    <button key={cert} type="button" onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        certifications.includes(cert)
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                      }`}>
                      {certifications.includes(cert) ? '✓ ' : ''}{cert}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input type="text" value={customCert} onChange={e => setCustomCert(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCert())}
                    placeholder="Other certification…"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                  />
                  <button type="button" onClick={addCustomCert}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    Add
                  </button>
                </div>
                {certifications.filter(c => !CERTIFICATIONS.includes(c)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {certifications.filter(c => !CERTIFICATIONS.includes(c)).map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 flex items-center gap-1">
                        {c}
                        <button type="button" onClick={() => toggleCert(c)} className="ml-0.5 text-brand-400 hover:text-brand-700 text-base leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="max-w-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your timezone <span className="text-red-500">*</span></label>

                  {autoDetectedTz && (() => {
                    const detected = TIMEZONES.find(tz => tz.value === autoDetectedTz)
                    if (!detected) return null
                    return (
                      <div className="flex items-start gap-3 mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                        <span className="text-green-500 text-base mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-semibold text-green-800">Timezone auto-detected</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            We selected <span className="font-semibold">{detected.label}</span> for{' '}
                            <span className="font-semibold">{detected.country}</span>.
                            Change it below if needed.
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  <select value={timezone} onChange={e => { setTimezone(e.target.value); setAutoDetectedTz(null) }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white">
                    <option value="" disabled>Select your timezone…</option>
                    {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Weekly slots <span className="text-red-500">*</span>
                    <span className="font-normal text-gray-400 ml-1">— select at least 2 hourly slots</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-4">
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

            {/* Step 3: Bio & Pricing */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Teaching bio <span className="text-red-500">*</span>
                    <span className="font-normal text-gray-400 ml-1">(min. 50 characters)</span>
                  </label>
                  <textarea value={teachingBio} onChange={e => setTeachingBio(e.target.value)}
                    rows={4} maxLength={600}
                    placeholder="Tell us about your experience, teaching style, and what makes your sessions engaging…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none transition"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className={`text-xs ${teachingBio.length < 50 ? 'text-red-400' : 'text-emerald-500 font-medium'}`}>
                      {teachingBio.length < 50 ? `${50 - teachingBio.length} more characters needed` : '✓ Looks good'}
                    </span>
                    <span className="text-xs text-gray-400">{teachingBio.length}/600</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Intro video URL <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="url" value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">YouTube or Loom. A 1–2 min intro video significantly boosts approval chances.</p>
                </div>
              </div>
            )}

            {/* Step 4: Complete profile */}
            {step === 4 && (
              <div className="space-y-8">
                {/* Profile photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Profile photo <span className="text-gray-400 font-normal">(optional)</span></label>
                  <AvatarUpload name="Teacher" initialUrl={null} fallbackGradient="from-brand-400 to-indigo-500" />
                  <p className="text-xs text-gray-400 mt-2">A friendly photo helps students trust you and boosts approval chances.</p>
                </div>

                {/* Years of experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of teaching experience <span className="text-red-500">*</span></label>
                  <div className="relative max-w-[200px]">
                    <input
                      type="number"
                      min={0}
                      max={60}
                      step={1}
                      value={yearsExperience}
                      onChange={e => setYearsExperience(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full pr-16 pl-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">years</span>
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

            {/* Step 5: Device check */}
            {step === 5 && (
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
                <p className="text-xs text-gray-400 text-center">This step is optional — you can skip it and submit your application.</p>
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
              {isPending ? 'Saving…' : step < LAST_STEP ? 'Continue →' : 'Submit Application →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

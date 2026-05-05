'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { saveOnboarding } from '@/lib/student/actions'
import { AvailabilityPicker } from '@/components/AvailabilityPicker'

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
  'Dutch', 'Polish', 'Turkish', 'Vietnamese', 'Thai', 'Swahili',
]

const LEVELS = [
  { key: 'A1', label: 'A1 – Beginner' },
  { key: 'A2', label: 'A2 – Elementary' },
  { key: 'B1', label: 'B1 – Intermediate' },
  { key: 'B2', label: 'B2 – Upper Intermediate' },
  { key: 'C1', label: 'C1 – Advanced' },
  { key: 'C2', label: 'C2 – Mastery' },
]

const TIMEZONES = [
  { label: 'UTC-8  Pacific (US & Canada)', value: 'America/Los_Angeles' },
  { label: 'UTC-7  Mountain (US & Canada)', value: 'America/Denver' },
  { label: 'UTC-6  Central (US & Canada)', value: 'America/Chicago' },
  { label: 'UTC-5  Eastern (US & Canada)', value: 'America/New_York' },
  { label: 'UTC-4  Atlantic / Santiago', value: 'America/Halifax' },
  { label: 'UTC-3  Buenos Aires / São Paulo', value: 'America/Argentina/Buenos_Aires' },
  { label: 'UTC-1  Azores', value: 'Atlantic/Azores' },
  { label: 'UTC+0  London / Lisbon (GMT)', value: 'Europe/London' },
  { label: 'UTC+1  Paris / Berlin / Madrid', value: 'Europe/Paris' },
  { label: 'UTC+2  Cairo / Athens / Helsinki', value: 'Europe/Helsinki' },
  { label: 'UTC+3  Moscow / Nairobi / Riyadh', value: 'Europe/Moscow' },
  { label: 'UTC+4  Dubai / Baku', value: 'Asia/Dubai' },
  { label: 'UTC+5  Karachi / Tashkent', value: 'Asia/Karachi' },
  { label: 'UTC+5:30  Mumbai / Delhi', value: 'Asia/Kolkata' },
  { label: 'UTC+6  Dhaka / Almaty', value: 'Asia/Dhaka' },
  { label: 'UTC+7  Bangkok / Jakarta / Hanoi', value: 'Asia/Bangkok' },
  { label: 'UTC+8  Beijing / Singapore / Perth', value: 'Asia/Singapore' },
  { label: 'UTC+9  Tokyo / Seoul', value: 'Asia/Tokyo' },
  { label: 'UTC+10  Sydney / Melbourne', value: 'Australia/Sydney' },
  { label: 'UTC+12  Auckland / Fiji', value: 'Pacific/Auckland' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const GOALS = [
  { key: 'travel', label: '✈️', desc: 'Travel' },
  { key: 'work', label: '💼', desc: 'Work & business' },
  { key: 'exam', label: '📝', desc: 'Study / exam' },
  { key: 'casual', label: '💬', desc: 'Casual conversation' },
  { key: 'heritage', label: '🏡', desc: 'Heritage / family' },
  { key: 'culture', label: '🎨', desc: 'Culture & media' },
]

const STEP_TITLES = [
  'Your languages',
  'Your level',
  'Your schedule',
  'Your goals',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0) // 0-indexed, 0-3
  const [nativeLang, setNativeLang] = useState('')
  const [targetLangs, setTargetLangs] = useState<string[]>([])
  const [levels, setLevels] = useState<Record<string, string>>({})
  const [timezone, setTimezone] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleTarget(lang: string) {
    setTargetLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
    setLevels(prev => {
      const next = { ...prev }
      if (next[lang]) delete next[lang]
      return next
    })
  }

  function setLevel(lang: string, level: string) {
    setLevels(prev => ({ ...prev, [lang]: level }))
  }

  function toggleGoal(key: string) {
    setGoals(prev =>
      prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]
    )
  }

  function canAdvance(): boolean {
    if (step === 0) return !!nativeLang && targetLangs.length > 0
    if (step === 1) return targetLangs.every(l => !!levels[l])
    if (step === 2) return !!timezone && availability.length > 0
    if (step === 3) return goals.length > 0
    return false
  }

  function handleNext() {
    if (step < 3) { setStep(s => s + 1); return }
    setError(null)
    startTransition(async () => {
      const result = await saveOnboarding({ nativeLang, targetLangs, levels, timezone, availability, goals })
      if (result && 'error' in result) setError(result.error)
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
        <div
          className="bg-brand-500 h-1 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm font-semibold text-brand-500 uppercase tracking-wider mb-1">
              Step {step + 1} — {STEP_TITLES[step]}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{stepHeading(step)}</h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">{stepSub(step)}</p>
          </div>

          {/* Step content */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
            {step === 0 && (
              <Step1
                nativeLang={nativeLang}
                targetLangs={targetLangs}
                onNative={setNativeLang}
                onToggleTarget={toggleTarget}
              />
            )}
            {step === 1 && (
              <Step2
                targetLangs={targetLangs}
                levels={levels}
                onLevel={setLevel}
              />
            )}
            {step === 2 && (
              <Step3
                timezone={timezone}
                availability={availability}
                onTimezone={setTimezone}
                onAvailabilityChange={setAvailability}
              />
            )}
            {step === 3 && (
              <Step4
                goals={goals}
                onToggle={toggleGoal}
              />
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Nav */}
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
              {isPending ? 'Saving…' : step < 3 ? 'Continue →' : 'Start learning →'}
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step ? 'w-6 h-2 bg-brand-500' : i < step ? 'w-2 h-2 bg-brand-300' : 'w-2 h-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function stepHeading(step: number) {
  return [
    'What languages are you working with?',
    'How well do you know each language?',
    'When are you available to learn?',
    'What is your main goal?',
  ][step]
}

function stepSub(step: number) {
  return [
    'Select your native language, then pick the languages you want to learn.',
    'Be honest — we use this to match you with the right group.',
    'We use this to pair you with a partner in a compatible timezone.',
    'This helps your teacher tailor every session to you.',
  ][step]
}

// ── Step 1 ──────────────────────────────────────────────────────────────────

function Step1({
  nativeLang,
  targetLangs,
  onNative,
  onToggleTarget,
}: {
  nativeLang: string
  targetLangs: string[]
  onNative: (l: string) => void
  onToggleTarget: (l: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">My native language</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => onNative(l)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                nativeLang === l
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">I want to learn <span className="text-gray-400 font-normal">(pick one or more)</span></label>
        <p className="text-xs text-gray-400 mb-3">Cannot be same as your native language.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.filter(l => l !== nativeLang).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => onToggleTarget(l)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                targetLangs.includes(l)
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {targetLangs.includes(l) ? '✓ ' : ''}{l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 2 ──────────────────────────────────────────────────────────────────

function Step2({
  targetLangs,
  levels,
  onLevel,
}: {
  targetLangs: string[]
  levels: Record<string, string>
  onLevel: (lang: string, level: string) => void
}) {
  return (
    <div className="space-y-6">
      {targetLangs.map(lang => (
        <div key={lang}>
          <label className="block text-sm font-semibold text-gray-700 mb-3">{lang}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LEVELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onLevel(lang, key)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  levels[lang] === key
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Step 3 ──────────────────────────────────────────────────────────────────

function Step3({
  timezone,
  availability,
  onTimezone,
  onAvailabilityChange,
}: {
  timezone: string
  availability: string[]
  onTimezone: (tz: string) => void
  onAvailabilityChange: (slots: string[]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your timezone</label>
        <select
          value={timezone}
          onChange={e => onTimezone(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
        >
          <option value="" disabled>Select your timezone…</option>
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {timezone ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            When are you free? <span className="text-gray-400 font-normal">(pick all that apply)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Click a period to select all hours. Use ▼ to fine-tune specific hours.
            Times shown in your timezone · stored in UTC.
          </p>
          <AvailabilityPicker
            utcSlots={availability}
            timezone={timezone}
            onChange={onAvailabilityChange}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-5 text-center text-sm text-gray-400">
          Select your timezone first to set availability.
        </div>
      )}
    </div>
  )
}


// ── Step 4 ──────────────────────────────────────────────────────────────────

function Step4({
  goals,
  onToggle,
}: {
  goals: string[]
  onToggle: (key: string) => void
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">Pick as many as apply. Your teacher will use this to personalise every class.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOALS.map(g => (
          <button
            key={g.key}
            type="button"
            onClick={() => onToggle(g.key)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              goals.includes(g.key)
                ? 'border-brand-500 bg-purple-50'
                : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-purple-50/50'
            }`}
          >
            <span className="text-3xl leading-none">{g.label}</span>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{g.desc}</div>
              {goals.includes(g.key) && (
                <div className="text-xs text-brand-500 mt-0.5">Selected ✓</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

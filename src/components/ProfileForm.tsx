'use client'
import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/student/actions'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'
import { AvailabilityPicker } from '@/components/AvailabilityPicker'

type EnrollmentRow = Enrollment & { courses: Pick<Course, 'name' | 'language'> | null }

const NATIVE_LANGUAGES = ['English', 'Urdu', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese', 'Italian']
const TARGET_LANGUAGES = ['English']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LEVEL_LABEL: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper Int.', C1: 'Advanced', C2: 'Mastery',
}
const GOALS = ['Travel', 'Business', 'Exam prep', 'Casual', 'Culture', 'Family']
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['morning', 'afternoon', 'evening']
const SLOT_LABEL = ['Morning\n6–12', 'Afternoon\n12–6', 'Evening\n6–11']

const COMMON_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'America/Mexico_City', 'America/Toronto', 'America/Vancouver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Moscow', 'Europe/Istanbul', 'Africa/Cairo', 'Africa/Lagos',
  'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok',
  'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
]

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  assigned:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

type Props = {
  profile: Profile & {
    native_lang?: string | null
    target_langs?: string[] | null
    levels?: Record<string, string> | null
    timezone?: string | null
    availability?: string[] | null
    goals?: string[] | null
  }
  enrollments: EnrollmentRow[]
}

export default function ProfileForm({ profile, enrollments }: Props) {
  const [name, setName] = useState(profile.name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [nativeLang, setNativeLang] = useState(profile.native_lang ?? '')
  const [targetLangs, setTargetLangs] = useState<string[]>(profile.target_langs ?? [])
  const [levels, setLevels] = useState<Record<string, string>>(profile.levels ?? {})
  const [timezone, setTimezone] = useState(profile.timezone ?? '')
  const [availability, setAvailability] = useState<string[]>(profile.availability ?? [])
  const [goals, setGoals] = useState<string[]>(profile.goals ?? [])

  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggleAvailability(key: string) {
    setAvailability(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function toggleTargetLang(lang: string) {
    setTargetLangs(prev => {
      if (prev.includes(lang)) {
        const next = prev.filter(l => l !== lang)
        const newLevels = { ...levels }
        delete newLevels[lang]
        setLevels(newLevels)
        return next
      }
      return [...prev, lang]
    })
  }

  function toggleGoal(g: string) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function save() {
    setSaved(false)
    setSaveError('')
    startTransition(async () => {
      const result = await updateProfile({
        name, bio, nativeLang, targetLangs, levels, timezone, availability, goals,
      })
      if (result?.error) {
        setSaveError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  const initial = profile.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="max-w-3xl space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Update your personal info, languages, and schedule.</p>
      </div>

      {/* Avatar + personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold">Logged in as</p>
            <p className="font-bold text-gray-900 truncate">{profile.name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bio <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell your teacher and partner a bit about yourself…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-6">
        <h2 className="font-bold text-gray-900">Languages</h2>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Native Language</p>
          <div className="flex flex-wrap gap-2">
            {NATIVE_LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setNativeLang(lang)}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border font-medium transition-all ${
                  nativeLang === lang
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Target Language</p>
          <div className="flex flex-wrap gap-2">
            {TARGET_LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleTargetLang(lang)}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border font-medium transition-all ${
                  targetLangs.includes(lang)
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {targetLangs.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-gray-50">
            <p className="text-sm font-semibold text-gray-700">Level in each language</p>
            {targetLangs.map(lang => (
              <div key={lang} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">{lang}</span>
                  {levels[lang] && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {LEVEL_LABEL[levels[lang]]}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                  {LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevels(prev => ({ ...prev, [lang]: lvl }))}
                      className={`text-[10px] sm:text-xs py-2 rounded-lg border font-bold transition-all ${
                        levels[lang] === lvl
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timezone + Availability */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-6 overflow-hidden">
        <h2 className="font-bold text-gray-900">Schedule</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 bg-white"
            >
              <option value="">Select your timezone…</option>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-700 mb-1">Availability</p>
          <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
            Times are shown in your local timezone and stored in UTC. Fine-tune specific hours for each day.
          </p>
          {timezone ? (
            <div>
              <AvailabilityPicker
                utcSlots={availability}
                timezone={timezone}
                onChange={setAvailability}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-400 border border-dashed border-gray-200">
              Select your timezone above to view availability.
            </div>
          )}
        </div>
      </div>


      {/* Goals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Learning Goals</h2>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGoal(g)}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border font-medium transition-all ${
                goals.includes(g)
                  ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={save}
          disabled={isPending}
          className="w-full sm:w-auto bg-brand-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-green-600 text-sm font-semibold">✓ Saved!</span>}
        {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
      </div>

      {/* Enrollment history */}
      {enrollments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-gray-900 mb-4">Enrollment History</h2>
          <div className="divide-y divide-gray-50">
            {enrollments.map(e => (
              <div key={e.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{e.courses?.name ?? 'Unknown course'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                    {new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex-shrink-0 ${STATUS_STYLE[e.status] ?? STATUS_STYLE.pending}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support */}
      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-500">
        Need to delete your account or export your data?{' '}
        <a href="mailto:support@langmaster.com" className="text-brand-500 hover:text-brand-600 font-medium">
          Email support →
        </a>
      </div>
    </div>
  )
}

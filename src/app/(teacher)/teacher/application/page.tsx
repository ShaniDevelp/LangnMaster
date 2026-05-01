'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { submitApplication } from '@/lib/teacher/actions'

// ── Data ────────────────────────────────────────────────────────────────────

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

// ── Shared layout primitives ─────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              Teacher Application
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">Questions? <a href="mailto:teachers@langmaster.com" className="text-[#6c4ff5] hover:underline">teachers@langmaster.com</a></span>
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">Sign in</Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

function SectionCard({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="font-bold text-gray-900 text-base">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function TeacherApplicationPage() {
  const [languagesTaught, setLanguagesTaught] = useState<{ lang: string; proficiency: string }[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [customCert, setCustomCert] = useState('')
  const [introVideoUrl, setIntroVideoUrl] = useState('')
  const [teachingBio, setTeachingBio] = useState('')
  const [timezone, setTimezone] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [rateExpectation, setRateExpectation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
  function toggleSlot(day: string, slot: string) {
    const key = `${day.toLowerCase()}-${slot.toLowerCase()}`
    setAvailability(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const canSubmit = languagesTaught.length > 0 && teachingBio.trim().length >= 50 && timezone !== '' && availability.length >= 2

  const missing = [
    languagesTaught.length === 0 && 'At least one teaching language',
    teachingBio.length < 50 && 'Teaching bio (50+ characters)',
    !timezone && 'Your timezone',
    availability.length < 2 && 'At least 2 availability slots',
  ].filter(Boolean)

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await submitApplication({ languagesTaught, certifications, introVideoUrl, teachingBio, availability, timezone, rateExpectation })
      if (result && 'error' in result) setError(result.error)
    })
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 xl:gap-14">

          {/* ── Left sidebar (sticky on desktop, header on mobile) ── */}
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              {/* Hero text */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c4ff5] to-indigo-500 text-2xl mb-4 shadow-lg shadow-purple-200">
                  👨‍🏫
                </div>
                <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                  Apply to teach on LangMaster
                </h1>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  We review every application within 48 hours and will email you with our decision.
                </p>
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What we need</p>
                {[
                  { done: languagesTaught.length > 0, label: 'Teaching languages' },
                  { done: teachingBio.length >= 50,   label: 'Teaching bio (50+ chars)' },
                  { done: !!timezone,                  label: 'Your timezone' },
                  { done: availability.length >= 2,   label: '2+ availability slots' },
                  { done: true,                        label: 'Certifications (optional)', optional: true },
                  { done: true,                        label: 'Intro video (optional)',    optional: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      item.optional ? 'bg-gray-100 text-gray-400' :
                      item.done     ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-400'
                    }`}>
                      {item.optional ? '—' : item.done ? '✓' : '○'}
                    </span>
                    <span className={`text-sm ${item.optional ? 'text-gray-400' : item.done ? 'text-gray-700' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* What happens after */}
              <div className="mt-4 bg-purple-50 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">What happens next</p>
                {[
                  { icon: '📧', text: 'Decision email within 48h' },
                  { icon: '🎯', text: 'Quick onboarding wizard' },
                  { icon: '👥', text: 'Admin assigns your first group' },
                  { icon: '🎥', text: 'First session starts Monday' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-base">{s.icon}</span>
                    <p className="text-sm text-purple-700">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Right: form sections ── */}
          <main className="space-y-6">

            {/* ── Section 1: Languages ── */}
            <SectionCard icon="🌍" title="Languages you teach" subtitle="Select each language and your proficiency level">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 mb-5">
                {LANGUAGES.map(lang => {
                  const sel = languagesTaught.find(l => l.lang === lang)
                  return (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                        sel ? 'bg-[#6c4ff5] text-white border-[#6c4ff5]'
                            : 'bg-white text-gray-700 border-gray-100 hover:border-purple-300 hover:text-[#6c4ff5]'
                      }`}>
                      {sel && '✓ '}{lang}
                    </button>
                  )
                })}
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
            </SectionCard>

            {/* ── Section 2: About you ── */}
            <SectionCard icon="✍️" title="About you" subtitle="Students will see your bio and video">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Teaching bio <span className="text-red-500">*</span>
                    <span className="font-normal text-gray-400 ml-1">(min. 50 characters)</span>
                  </label>
                  <textarea value={teachingBio} onChange={e => setTeachingBio(e.target.value)}
                    rows={4} maxLength={600}
                    placeholder="Tell us about your experience, teaching style, and what makes your sessions engaging…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">YouTube or Loom. A 1–2 min intro video significantly boosts approval chances.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Rate expectation <span className="text-gray-400 font-normal">(optional, USD/session)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                    <input type="number" value={rateExpectation} onChange={e => setRateExpectation(e.target.value)}
                      placeholder="e.g. 25" min={0} step={5}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">For admin reference only. Final rate agreed during onboarding.</p>
                </div>
              </div>
            </SectionCard>

            {/* ── Section 3: Certifications ── */}
            <SectionCard icon="🎓" title="Certifications" subtitle="Optional — helps show your qualifications to students">
              <div className="flex flex-wrap gap-2 mb-4">
                {CERTIFICATIONS.map(cert => (
                  <button key={cert} type="button" onClick={() => toggleCert(cert)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      certifications.includes(cert)
                        ? 'bg-[#6c4ff5] text-white border-[#6c4ff5]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}>
                    {certifications.includes(cert) ? '✓ ' : ''}{cert}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input type="text" value={customCert} onChange={e => setCustomCert(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCert())}
                  placeholder="Other certification…"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
                <button type="button" onClick={addCustomCert}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  Add
                </button>
              </div>
              {certifications.filter(c => !CERTIFICATIONS.includes(c)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {certifications.filter(c => !CERTIFICATIONS.includes(c)).map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => toggleCert(c)} className="ml-0.5 text-purple-400 hover:text-purple-700 text-base leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ── Section 4: Availability ── */}
            <SectionCard icon="📅" title="Your availability" subtitle="When can you teach? Admin schedules groups around these slots">
              <div className="mb-6 max-w-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your timezone <span className="text-red-500">*</span></label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white">
                  <option value="" disabled>Select your timezone…</option>
                  {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Weekly slots <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 ml-1">— select at least 2</span>
              </label>
              <p className="text-xs text-gray-400 mb-4">Morning = 6am–12pm · Afternoon = 12pm–6pm · Evening = 6pm–11pm (your timezone)</p>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="w-24 sm:w-28" />
                      {DAYS.map(d => (
                        <th key={d} className="pb-3 text-xs font-semibold text-gray-500 text-center min-w-[44px]">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {SLOTS.map(slot => (
                      <tr key={slot}>
                        <td className="pr-4 py-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">{slot}</td>
                        {DAYS.map(day => {
                          const key = `${day.toLowerCase()}-${slot.toLowerCase()}`
                          const active = availability.includes(key)
                          return (
                            <td key={day} className="py-1.5 px-0.5 text-center">
                              <button type="button" onClick={() => toggleSlot(day, slot)}
                                aria-label={`${day} ${slot}`} aria-pressed={active}
                                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
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
              {availability.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-3">✓ {availability.length} slot{availability.length !== 1 ? 's' : ''} selected</p>
              )}
            </SectionCard>

            {/* ── Submit ── */}
            {missing.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-amber-800 mb-2">Complete these before submitting:</p>
                <ul className="space-y-1">
                  {missing.map(m => (
                    <li key={String(m)} className="text-sm text-amber-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />{m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-4">{error}</div>
            )}

            <div className="flex items-center gap-4 pb-12">
              <button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending}
                className="flex-1 sm:flex-none sm:px-12 py-4 rounded-2xl bg-[#6c4ff5] text-white font-bold text-base hover:bg-[#5c3de8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-200">
                {isPending ? 'Submitting…' : 'Submit application →'}
              </button>
              <p className="text-xs text-gray-400 hidden sm:block">We&apos;ll email you within 48 hours.</p>
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  )
}

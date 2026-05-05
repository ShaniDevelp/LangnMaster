'use client'
import { useState, useTransition } from 'react'
import { saveTeacherProfile } from '@/lib/teacher/profile-actions'
import { saveNotificationPrefs, saveAvailability } from '@/lib/teacher/phase4-actions'
import { AvailabilityPicker } from '@/components/AvailabilityPicker'

type ProfileData = {
  name: string
  bio: string | null
  timezone: string | null
  intro_video_url: string | null
  years_experience: number
  certifications: string[]
  languages_taught: { lang: string; proficiency: string }[]
  rate_per_session: number
  rating: number
  review_count: number
  availability: string[]
  notification_prefs: Record<string, boolean>
}

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

const CERT_OPTIONS = ['TEFL', 'CELTA', 'DELTA', 'TESOL', 'DELF/DALF', 'DELE', 'HSK Instructor', 'Cambridge TKT', 'MA Education']
const LANGUAGES    = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian']
const PROFICIENCY  = ['native', 'near_native', 'fluent']

const NOTIF_OPTIONS: { key: string; label: string; desc: string }[] = [
  { key: 'new_group',         label: 'New group assigned',       desc: 'When admin adds you to a new student group' },
  { key: 'session_reminder_24h', label: 'Session reminder (24h)', desc: 'Email 24 hours before a scheduled session' },
  { key: 'session_reminder_1h',  label: 'Session reminder (1h)',  desc: 'Push notification 1 hour before a session' },
  { key: 'review_received',   label: 'Student review',           desc: 'When a student leaves a rating or review' },
  { key: 'payout_processed',  label: 'Payout processed',         desc: 'When a payout is sent to your account' },
  { key: 'availability_conflict', label: 'Availability conflict', desc: 'If admin schedules outside your availability' },
]




type Tab = 'public' | 'availability' | 'notifications' | 'account'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'public',        label: 'Public info',      icon: '👤' },
  { id: 'availability',  label: 'Availability',     icon: '📅' },
  { id: 'notifications', label: 'Notifications',    icon: '🔔' },
  { id: 'account',       label: 'Account',          icon: '⚙️' },
]

function SectionCard({ title, icon, children, desc }: { title: string; icon: string; children: React.ReactNode; desc?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
            {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

type Props = { profile: ProfileData; userId: string }

export function ProfileClient({ profile, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('public')

  // Public info state
  const [name, setName]                   = useState(profile.name)
  const [bio, setBio]                     = useState(profile.bio ?? '')
  const [timezone, setTimezone]           = useState(profile.timezone ?? '')
  const [introVideoUrl, setIntroVideoUrl] = useState(profile.intro_video_url ?? '')
  const [yearsExp, setYearsExp]           = useState(profile.years_experience)
  const [certs, setCerts]                 = useState<string[]>(profile.certifications)
  const [languages, setLanguages]         = useState(profile.languages_taught)
  const [rate, setRate]                   = useState(profile.rate_per_session)
  const [customCert, setCustomCert]       = useState('')

  // Availability state
  const [availability, setAvailability]   = useState<string[]>(profile.availability)

  // Notif prefs state
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, profile.notification_prefs[o.key] ?? true]))
  )

  const [savingProfile, startSaveProfile]   = useTransition()
  const [savingNotif, startSaveNotif]       = useTransition()
  const [savingAvail, startSaveAvail]       = useTransition()
  const [profileMsg, setProfileMsg]         = useState<string | null>(null)
  const [notifMsg, setNotifMsg]             = useState<string | null>(null)
  const [availMsg, setAvailMsg]             = useState<string | null>(null)

  function toggleCert(c: string) { setCerts(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]) }
  function addCustomCert() {
    const t = customCert.trim(); if (t && !certs.includes(t)) { setCerts(p => [...p, t]); setCustomCert('') }
  }
  function toggleLanguage(lang: string) {
    setLanguages(p => p.find(l => l.lang === lang) ? p.filter(l => l.lang !== lang) : [...p, { lang, proficiency: 'native' }])
  }
  function setProficiency(lang: string, proficiency: string) {
    setLanguages(p => p.map(l => l.lang === lang ? { ...l, proficiency } : l))
  }
  function toggleSlot(day: string, slot: string) {
    const key = `${day.toLowerCase()}-${slot.toLowerCase()}`
    setAvailability(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  function handleSaveProfile() {
    startSaveProfile(async () => {
      const res = await saveTeacherProfile({ name, bio, timezone, introVideoUrl, yearsExp, certs, languages, rate })
      setProfileMsg(res.error ? `Error: ${res.error}` : 'Profile saved ✓')
      setTimeout(() => setProfileMsg(null), 3000)
    })
  }

  function handleSaveNotifPrefs() {
    startSaveNotif(async () => {
      const res = await saveNotificationPrefs(notifPrefs)
      setNotifMsg(res.error ? `Error: ${res.error}` : 'Preferences saved ✓')
      setTimeout(() => setNotifMsg(null), 3000)
    })
  }

  function handleSaveAvailability() {
    startSaveAvail(async () => {
      const res = await saveAvailability(availability)
      setAvailMsg(res.error ? `Error: ${res.error}` : 'Availability saved ✓')
      setTimeout(() => setAvailMsg(null), 3000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Profile & Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your public info, availability, and preferences</p>
        </div>
        {/* View public profile link */}
        <a href={`/teachers/${userId}`} target="_blank" rel="noopener noreferrer"
          className="self-start sm:self-auto text-sm font-semibold text-[#6c4ff5] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors">
          👁 View public profile →
        </a>
      </div>

      {/* Rating snapshot */}
      {profile.review_count > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-5">
          <div className="text-4xl font-bold text-amber-600">{profile.rating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={`text-lg ${i <= Math.round(profile.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <p className="text-sm text-amber-700 mt-0.5">{profile.review_count} student review{profile.review_count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ Tab: Public info ══ */}
      {activeTab === 'public' && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="space-y-5">
              <SectionCard icon="📋" title="Basic info" desc="Displayed on your public teacher profile">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teaching bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={500}
                      placeholder="Tell students about your experience and teaching style…"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years experience</label>
                      <input type="number" value={yearsExp} onChange={e => setYearsExp(parseInt(e.target.value) || 0)} min={0} max={50}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rate / session (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} min={0} step={5}
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Intro video URL <span className="font-normal text-gray-400">(YouTube/Loom)</span></label>
                    <input type="url" value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/…"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white transition">
                      <option value="">Select timezone…</option>
                      {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-5">
              <SectionCard icon="🌍" title="Teaching languages" desc="Languages you teach, shown publicly">
                <div className="flex flex-wrap gap-2 mb-4">
                  {LANGUAGES.map(lang => {
                    const sel = languages.find(l => l.lang === lang)
                    return (
                      <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                          sel ? 'bg-[#6c4ff5] text-white border-[#6c4ff5]' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                        }`}>
                        {sel ? '✓ ' : ''}{lang}
                      </button>
                    )
                  })}
                </div>
                {languages.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    {languages.map(({ lang, proficiency }) => (
                      <div key={lang} className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">{lang}</span>
                        <div className="flex gap-2 flex-wrap">
                          {PROFICIENCY.map(p => (
                            <button key={p} type="button" onClick={() => setProficiency(lang, p)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${
                                proficiency === p ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                              }`}>
                              {p.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard icon="🎓" title="Certifications" desc="Teaching qualifications, shown publicly">
                <div className="flex flex-wrap gap-2 mb-3">
                  {CERT_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleCert(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        certs.includes(c) ? 'bg-[#6c4ff5] text-white border-[#6c4ff5]' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}>
                      {certs.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={customCert} onChange={e => setCustomCert(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCert())}
                    placeholder="Other certification…"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                  <button type="button" onClick={addCustomCert}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">Add</button>
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {profileMsg && (
              <span className={`text-sm font-medium ${profileMsg.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
                {profileMsg}
              </span>
            )}
            <button onClick={handleSaveProfile} disabled={savingProfile}
              className="px-8 py-3 rounded-xl bg-[#6c4ff5] text-white font-bold text-sm hover:bg-[#5c3de8] transition-colors disabled:opacity-40 shadow-md shadow-purple-200">
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      )}

      {/* ══ Tab: Availability ══ */}
      {activeTab === 'availability' && (
        <div className="space-y-5">
          <SectionCard icon="📅" title="Weekly availability" desc="Select your available hours. Admin uses this to schedule sessions. Times shown in your timezone · stored in UTC.">
            {timezone ? (
              <AvailabilityPicker
                utcSlots={availability}
                timezone={timezone}
                onChange={setAvailability}
              />
            ) : (
              <div className="bg-gray-50 rounded-2xl p-5 text-center text-sm text-gray-400">
                Set your timezone in Public Info first.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50">
              {availMsg && <span className={`text-sm font-medium ${availMsg.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{availMsg}</span>}
              <button onClick={handleSaveAvailability} disabled={savingAvail}
                className="px-6 py-2.5 rounded-xl bg-[#6c4ff5] text-white font-bold text-sm hover:bg-[#5c3de8] transition-colors disabled:opacity-40">
                {savingAvail ? 'Saving…' : 'Save availability'}
              </button>
            </div>
          </SectionCard>

          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">How it works</p>
            <ul className="space-y-1.5 text-sm text-purple-700">
              <li>✅ These slots represent your <strong>recurring weekly</strong> availability</li>
              <li>✅ Admin will schedule sessions within your available slots</li>
              <li>✅ Changes take effect immediately and notify the admin team</li>
            </ul>
          </div>
        </div>
      )}

      {/* ══ Tab: Notifications ══ */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <SectionCard icon="🔔" title="Notification preferences" desc="Choose what you want to be notified about">
            <div className="space-y-4">
              {NOTIF_OPTIONS.map(opt => (
                <label key={opt.key} className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="sr-only peer"
                      checked={notifPrefs[opt.key] ?? true}
                      onChange={e => setNotifPrefs(p => ({ ...p, [opt.key]: e.target.checked }))} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      (notifPrefs[opt.key] ?? true) ? 'bg-[#6c4ff5]' : 'bg-gray-200'
                    }`} />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      (notifPrefs[opt.key] ?? true) ? 'translate-x-5' : ''
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#6c4ff5] transition-colors">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50">
              {notifMsg && <span className={`text-sm font-medium ${notifMsg.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{notifMsg}</span>}
              <button onClick={handleSaveNotifPrefs} disabled={savingNotif}
                className="px-6 py-2.5 rounded-xl bg-[#6c4ff5] text-white font-bold text-sm hover:bg-[#5c3de8] transition-colors disabled:opacity-40">
                {savingNotif ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══ Tab: Account ══ */}
      {activeTab === 'account' && (
        <div className="space-y-5">
          <SectionCard icon="🔒" title="Change password" desc="Update your account password">
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
                <input type="password" placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm new password</label>
                <input type="password" placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-colors">
                Update password
              </button>
              <p className="text-xs text-gray-400">Password changes require email confirmation via Supabase auth.</p>
            </div>
          </SectionCard>

          <SectionCard icon="⚠️" title="Danger zone" desc="Irreversible account actions">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-red-100 bg-red-50">
                <div>
                  <p className="text-sm font-bold text-red-700">Delete account</p>
                  <p className="text-xs text-red-500 mt-0.5">This will permanently remove all your data. Sessions will be cancelled.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex-shrink-0">
                  Delete
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}

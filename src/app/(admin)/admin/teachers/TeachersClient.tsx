'use client'
import { useState, useTransition, useEffect } from 'react'
import { utcSlotsToLocal } from '@/lib/availability'

type ApplicationRow = {
  status: string
  submitted_at: string
  reviewed_at: string | null
  admin_notes: string | null
  languages_taught: { lang: string; proficiency: string }[]
  certifications: string[]
  teaching_bio: string | null
  intro_video_url: string | null
  timezone: string | null
  availability: string[]
  rate_expectation: number | null
}

type TeacherWithApplication = {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  years_experience: number | null
  created_at: string
  groups: { id: string; status: string; courses: { name: string } | null }[]
  teacher_applications: ApplicationRow | null
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Convert UTC hourly slots ("Mon-13:00") into readable per-day hour ranges,
// shown in the teacher's own timezone.
function formatAvailability(
  utcSlots: string[],
  timezone: string | null,
): { day: string; label: string }[] {
  if (!utcSlots?.length) return []
  const local = timezone ? utcSlotsToLocal(utcSlots, timezone) : utcSlots
  const byDay: Record<string, number[]> = {}
  for (const s of local) {
    const i = s.indexOf('-')
    if (i < 0) continue
    const day = s.slice(0, i)
    const hh = parseInt(s.slice(i + 1), 10)
    if (Number.isNaN(hh)) continue
    ;(byDay[day] ||= []).push(hh)
  }
  return DAY_ORDER.filter(d => byDay[d]).map(d => {
    const hrs = [...new Set(byDay[d])].sort((a, b) => a - b)
    const ranges: [number, number][] = []
    let start = hrs[0]
    let prev = hrs[0]
    for (let k = 1; k < hrs.length; k++) {
      if (hrs[k] === prev + 1) prev = hrs[k]
      else { ranges.push([start, prev]); start = hrs[k]; prev = hrs[k] }
    }
    ranges.push([start, prev])
    const label = ranges
      .map(([a, b]) => (a === b ? `${pad(a)}:00` : `${pad(a)}:00–${pad(b + 1)}:00`))
      .join(', ')
    return { day: d, label }
  })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PROFICIENCY_LABEL: Record<string, string> = {
  native: 'Native',
  near_native: 'Near-native',
  fluent: 'Fluent',
}

function ApproveRejectButtons({
  teacher,
  onStatusChange,
}: {
  teacher: TeacherWithApplication
  onStatusChange: (teacherId: string, newStatus: 'approved' | 'rejected') => void
}) {
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const appStatus = teacher.teacher_applications?.status
  const hasNoApplication = !teacher.teacher_applications

  if (appStatus === 'approved') {
    return <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">✓ Approved</span>
  }
  if (appStatus === 'rejected') {
    return <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">✗ Rejected</span>
  }

  async function act(action: 'approve' | 'reject') {
    startTransition(async () => {
      await fetch('/api/admin/approve-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id, action, adminNotes: notes, noApplication: hasNoApplication }),
      })
      setOpen(false)
      onStatusChange(teacher.id, action === 'approve' ? 'approved' : 'rejected')
    })
  }

  const buttonLabel = hasNoApplication ? '🔑 Override approve ▾' : '⏳ Pending review ▾'
  const buttonStyle = hasNoApplication
    ? 'text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors'
    : 'text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors'

  return (
    <div className="relative">
      {hasNoApplication && (
        <p className="text-xs text-gray-400 italic mb-1.5">No application on file</p>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={buttonStyle}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {hasNoApplication ? 'Admin override' : 'Review application'}
            </p>
            {hasNoApplication && (
              <p className="text-xs text-gray-400 mt-1">
                No application submitted. Approving grants the teacher full access and lets them complete the onboarding wizard.
              </p>
            )}
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder={hasNoApplication ? 'Optional internal notes…' : 'Optional notes to teacher (shown on rejection)…'}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => act('approve')}
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isPending ? '…' : '✓ Approve'}
            </button>
            {!hasNoApplication && (
              <button
                type="button"
                onClick={() => act('reject')}
                disabled={isPending}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                ✗ Reject
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewDetailsButton({ teacher }: { teacher: TeacherWithApplication }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-[#6c4ff5] font-semibold hover:underline"
      >
        👁 View application
      </button>
      {open && <TeacherDetailModal teacher={teacher} onClose={() => setOpen(false)} />}
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
  }
  const label: Record<string, string> = {
    approved: '✓ Approved',
    rejected: '✗ Rejected',
    pending: '⏳ Pending review',
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? status}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}

function TeacherDetailModal({
  teacher,
  onClose,
}: {
  teacher: TeacherWithApplication
  onClose: () => void
}) {
  const app = teacher.teacher_applications
  const slots = app ? formatAvailability(app.availability, app.timezone) : []
  const activeGroups = teacher.groups.filter(g => g.status === 'active')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            {teacher.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teacher.avatar_url} alt={teacher.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {teacher.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{teacher.name}</h2>
              <p className="text-xs text-gray-400">Joined {formatDate(teacher.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {app && <StatusBadge status={app.status} />}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg hover:bg-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6">
          {!app ? (
            <p className="text-sm text-gray-400 italic">No application on file for this teacher.</p>
          ) : (
            <>
              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Submitted">{formatDate(app.submitted_at)}</Field>
                <Field label="Reviewed">{formatDate(app.reviewed_at)}</Field>
                <Field label="Timezone">{app.timezone || '—'}</Field>
                <Field label="Rate expectation">
                  {app.rate_expectation != null ? `Rs ${app.rate_expectation.toLocaleString()}/session` : '—'}
                </Field>
                {teacher.years_experience != null && (
                  <Field label="Experience">{teacher.years_experience} yr{teacher.years_experience === 1 ? '' : 's'}</Field>
                )}
              </div>

              {/* Languages */}
              <Field label="Languages taught">
                {app.languages_taught?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {app.languages_taught.map(l => (
                      <span key={l.lang} className="text-xs font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                        {l.lang}
                        <span className="font-normal text-purple-400"> · {PROFICIENCY_LABEL[l.proficiency] ?? l.proficiency}</span>
                      </span>
                    ))}
                  </div>
                ) : '—'}
              </Field>

              {/* Certifications */}
              <Field label="Certifications">
                {app.certifications?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {app.certifications.map(c => (
                      <span key={c} className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                ) : <span className="text-gray-400">None listed</span>}
              </Field>

              {/* Bio */}
              <Field label="Teaching bio">
                {app.teaching_bio
                  ? <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{app.teaching_bio}</p>
                  : <span className="text-gray-400">—</span>}
              </Field>

              {/* Intro video */}
              <Field label="Intro video">
                {app.intro_video_url ? (
                  <a href={app.intro_video_url} target="_blank" rel="noopener noreferrer" className="text-[#6c4ff5] hover:underline break-all">
                    {app.intro_video_url}
                  </a>
                ) : <span className="text-gray-400">Not provided</span>}
              </Field>

              {/* Availability */}
              <Field label={`Weekly availability${app.timezone ? ` (${app.timezone})` : ''}`}>
                {slots.length ? (
                  <div className="space-y-1.5">
                    {slots.map(s => (
                      <div key={s.day} className="flex gap-3 text-sm">
                        <span className="font-bold text-gray-700 w-10 flex-shrink-0">{s.day}</span>
                        <span className="text-gray-600">{s.label}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-1">{app.availability.length} hourly slot{app.availability.length === 1 ? '' : 's'} total</p>
                  </div>
                ) : <span className="text-gray-400">No slots selected</span>}
              </Field>

              {/* Admin notes */}
              {app.admin_notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">Admin notes</p>
                  <p className="text-sm text-amber-800">{app.admin_notes}</p>
                </div>
              )}
            </>
          )}

          {/* Profile info */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            {teacher.bio && (
              <Field label="Profile bio">
                <p className="leading-relaxed text-gray-700">{teacher.bio}</p>
              </Field>
            )}
            <Field label="Active groups">
              {activeGroups.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeGroups.map(g => (
                    <span key={g.id} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                      {g.courses?.name ?? 'Group'}
                    </span>
                  ))}
                </div>
              ) : <span className="text-gray-400">None</span>}
            </Field>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeachersClient({ teachers: initialTeachers }: { teachers: TeacherWithApplication[] }) {
  const [teachers, setTeachers] = useState<TeacherWithApplication[]>(initialTeachers)

  function handleStatusChange(teacherId: string, newStatus: 'approved' | 'rejected') {
    setTeachers(prev => prev.map(t => {
      if (t.id !== teacherId) return t
      return {
        ...t,
        teacher_applications: t.teacher_applications
          ? { ...t.teacher_applications, status: newStatus }
          : null,
      }
    }))
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'today'
    if (d === 1) return 'yesterday'
    return `${d}d ago`
  }

  const pending = teachers.filter(t => t.teacher_applications?.status === 'pending')
  const rest = teachers.filter(t => t.teacher_applications?.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <p className="text-gray-500 text-sm mt-1">
          {teachers.length} registered
          {pending.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length} pending review
            </span>
          )}
        </p>
      </div>

      {/* Pending applications first */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Applications awaiting review
          </h2>
          <div className="space-y-3">
            {pending.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">
                        Applied {timeAgo(t.teacher_applications!.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <ApproveRejectButtons teacher={t} onStatusChange={handleStatusChange} />
                </div>
                <div className="mt-3">
                  <ViewDetailsButton teacher={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All teachers table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teacher</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Application</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Groups</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No teachers yet</td>
                </tr>
              ) : teachers.map(t => {
                const activeGroups = t.groups.filter(g => g.status === 'active')
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          {t.bio && <p className="text-xs text-gray-400 max-w-xs truncate">{t.bio}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ApproveRejectButtons teacher={t} onStatusChange={handleStatusChange} />
                      <div className="mt-1.5">
                        <ViewDetailsButton teacher={t} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {activeGroups.length === 0 ? (
                          <span className="text-xs text-gray-400">None</span>
                        ) : activeGroups.slice(0, 2).map(g => (
                          <span key={g.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            {g.courses?.name}
                          </span>
                        ))}
                        {activeGroups.length > 2 && (
                          <span className="text-xs text-gray-400">+{activeGroups.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(t.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved teachers without application (legacy) */}
      {rest.filter(t => !t.teacher_applications).length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {rest.filter(t => !t.teacher_applications).length} teacher(s) registered before the application system — no application on file.
        </p>
      )}
    </div>
  )
}

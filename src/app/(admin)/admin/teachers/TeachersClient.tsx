'use client'
import { useState, useTransition } from 'react'

type ApplicationRow = {
  status: string
  submitted_at: string
  admin_notes: string | null
  languages_taught: { lang: string; proficiency: string }[]
  certifications: string[]
  teaching_bio: string | null
  intro_video_url: string | null
  timezone: string | null
  availability: string[]
}

type TeacherWithApplication = {
  id: string
  name: string
  bio: string | null
  created_at: string
  groups: { id: string; status: string; courses: { name: string } | null }[]
  teacher_applications: ApplicationRow | null
}

function ApproveRejectButtons({ teacher }: { teacher: TeacherWithApplication }) {
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  const appStatus = teacher.teacher_applications?.status
  const hasNoApplication = !teacher.teacher_applications

  if (done) {
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        done === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }`}>
        {done === 'approved' ? '✓ Approved' : '✗ Rejected'}
      </span>
    )
  }

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
      setDone(action === 'approve' ? 'approved' : 'rejected')
      setOpen(false)
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

function ApplicationDetail({ app }: { app: ApplicationRow }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-xs text-[#6c4ff5] font-medium hover:underline"
      >
        {open ? 'Hide details ▴' : 'View application ▾'}
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
          {app.languages_taught?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-500">Languages: </span>
              {app.languages_taught.map(l => `${l.lang} (${l.proficiency})`).join(', ')}
            </div>
          )}
          {app.certifications?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-500">Certs: </span>
              {app.certifications.join(', ')}
            </div>
          )}
          {app.timezone && (
            <div>
              <span className="font-semibold text-gray-500">Timezone: </span>{app.timezone}
            </div>
          )}
          {app.availability?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-500">Availability: </span>
              {app.availability.length} slots
            </div>
          )}
          {app.teaching_bio && (
            <div>
              <span className="font-semibold text-gray-500">Bio: </span>
              <span className="text-gray-500 italic">{app.teaching_bio.slice(0, 120)}…</span>
            </div>
          )}
          {app.intro_video_url && (
            <div>
              <span className="font-semibold text-gray-500">Video: </span>
              <a href={app.intro_video_url} target="_blank" rel="noopener noreferrer" className="text-[#6c4ff5] hover:underline truncate block max-w-xs">
                {app.intro_video_url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TeachersClient({ teachers }: { teachers: TeacherWithApplication[] }) {
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
                  <ApproveRejectButtons teacher={t} />
                </div>
                {t.teacher_applications && (
                  <div className="mt-3">
                    <ApplicationDetail app={t.teacher_applications} />
                  </div>
                )}
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
                const appStatus = t.teacher_applications?.status
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
                      <ApproveRejectButtons teacher={t} />
                      {appStatus === 'pending' || !appStatus ? null : (
                        t.teacher_applications && (
                          <div className="mt-1">
                            <ApplicationDetail app={t.teacher_applications} />
                          </div>
                        )
                      )}
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

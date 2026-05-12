'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptGroupProposal, declineGroupProposal } from '@/lib/teacher/actions'

type Proposal = {
  id: string
  courseName: string
  courseLanguage: string
  courseLevel: string
  sessionsPerWeek: number
  durationWeeks: number
  proposedAt: string | null
  students: Array<{ id: string; name: string; avatar_url: string | null }>
  sessionTimes: string[]
}

type CardState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'declining' }
  | { kind: 'error'; message: string }

export function ProposalsClient({ proposals }: { proposals: Proposal[] }) {
  const router = useRouter()
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(proposals.map(p => [p.id, { kind: 'idle' as const }]))
  )
  const [reasonOpen, setReasonOpen] = useState<Record<string, boolean>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [, startTransition] = useTransition()

  function accept(p: Proposal) {
    setStates(prev => ({ ...prev, [p.id]: { kind: 'submitting' } }))
    startTransition(async () => {
      const res = await acceptGroupProposal(p.id)
      if (res.error) {
        setStates(prev => ({ ...prev, [p.id]: { kind: 'error', message: res.error! } }))
      } else {
        router.refresh()
      }
    })
  }

  function decline(p: Proposal) {
    setStates(prev => ({ ...prev, [p.id]: { kind: 'declining' } }))
    startTransition(async () => {
      const res = await declineGroupProposal(p.id, reasons[p.id] || undefined)
      if (res.error) {
        setStates(prev => ({ ...prev, [p.id]: { kind: 'error', message: res.error! } }))
      } else {
        router.refresh()
      }
    })
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  // Show only first-week sessions in the preview (rest repeat weekly)
  function firstWeekSessions(times: string[]) {
    if (times.length === 0) return []
    const firstStart = new Date(times[0]).getTime()
    return times.filter(t => new Date(t).getTime() < firstStart + 7 * 86400000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
      {proposals.map(p => {
        const state = states[p.id]
        const totalSessions = p.sessionsPerWeek * p.durationWeeks
        const previewSessions = firstWeekSessions(p.sessionTimes)
        const submitting = state?.kind === 'submitting' || state?.kind === 'declining'

        return (
          <div key={p.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">⏳ Proposal</span>
              {p.proposedAt && (
                <span className="text-[11px] text-amber-700">
                  {new Date(p.proposedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Course */}
              <div>
                <h3 className="font-bold text-gray-900 text-base">{p.courseName}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {p.courseLanguage && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">
                      {p.courseLanguage}
                    </span>
                  )}
                  {p.courseLevel && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                      {p.courseLevel}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500">
                    {p.sessionsPerWeek}× / week · {p.durationWeeks} weeks · {totalSessions} session{totalSessions !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Students */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Students ({p.students.length})</span>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {p.students.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-700">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule preview */}
              {previewSessions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weekly Schedule</span>
                  <div className="space-y-1.5 mt-2">
                    {previewSessions.map((time) => (
                      <div key={time} className="flex items-center gap-2 text-xs text-gray-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5">
                        <span className="text-purple-600">📅</span>
                        <span className="font-medium">{formatTime(time)}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 mt-1">Repeats weekly for {p.durationWeeks} weeks · times shown in your local timezone</p>
                  </div>
                </div>
              )}

              {/* Decline reason */}
              {reasonOpen[p.id] && (
                <textarea
                  value={reasons[p.id] ?? ''}
                  onChange={e => setReasons(prev => ({ ...prev, [p.id]: e.target.value }))}
                  rows={2}
                  placeholder="Optional: tell admin why you're declining (e.g. schedule conflict)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                />
              )}

              {/* Error */}
              {state?.kind === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  ✗ {state.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => accept(p)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {state?.kind === 'submitting' ? 'Accepting…' : '✓ Accept'}
                </button>
                {!reasonOpen[p.id] ? (
                  <button
                    onClick={() => setReasonOpen(prev => ({ ...prev, [p.id]: true }))}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    ✗ Decline
                  </button>
                ) : (
                  <button
                    onClick={() => decline(p)}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {state?.kind === 'declining' ? 'Declining…' : 'Confirm Decline'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

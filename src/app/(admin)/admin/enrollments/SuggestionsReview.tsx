'use client'
import { useState, useTransition, useEffect } from 'react'
import { assignManualGroup } from '@/lib/admin/phase2-actions'
import type { ProposedGroup } from '@/lib/admin/actions'
import { utcSlotsToLocal } from '@/lib/availability'

type Props = {
  proposals: ProposedGroup[]
}

type CardState =
  | { kind: 'pending' }
  | { kind: 'submitting' }
  | { kind: 'approved' }
  | { kind: 'skipped' }
  | { kind: 'error'; message: string }

const DAY_LABEL: Record<string, string> = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' }

export function SuggestionsReview({ proposals }: Props) {
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(proposals.map(p => [p.id, { kind: 'pending' as const }]))
  )
  const [overrideTeacher, setOverrideTeacher] = useState<Record<string, string>>({})
  const [requireAcceptance, setRequireAcceptance] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [timezone, setTimezone] = useState('UTC')

  // Hydrate timezone client-side after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  function approve(p: ProposedGroup) {
    const teacherId = overrideTeacher[p.id] ?? p.proposedTeacher?.id
    if (!teacherId) {
      setStates(prev => ({ ...prev, [p.id]: { kind: 'error', message: 'No teacher selected' } }))
      return
    }
    if (p.proposedSlots.length !== p.sessionsPerWeek) {
      setStates(prev => ({ ...prev, [p.id]: { kind: 'error', message: `Need ${p.sessionsPerWeek} slot(s); only ${p.proposedSlots.length} available. Use Group Builder below.` } }))
      return
    }
    setStates(prev => ({ ...prev, [p.id]: { kind: 'submitting' } }))
    startTransition(async () => {
      const res = await assignManualGroup({
        enrollmentIds: p.enrollments.map(e => e.enrollmentId),
        courseId: p.courseId,
        teacherId,
        slots: p.proposedSlots,
        requireAcceptance,
      })
      if (res.error) {
        setStates(prev => ({ ...prev, [p.id]: { kind: 'error', message: res.error! } }))
      } else {
        setStates(prev => ({ ...prev, [p.id]: { kind: 'approved' } }))
      }
    })
  }

  function skip(p: ProposedGroup) {
    setStates(prev => ({ ...prev, [p.id]: { kind: 'skipped' } }))
  }

  function approveAll() {
    for (const p of proposals) {
      const state = states[p.id]
      if (state.kind !== 'pending') continue
      if (!p.proposedTeacher || p.proposedSlots.length !== p.sessionsPerWeek) continue
      approve(p)
    }
  }

  const visible = proposals.filter(p => states[p.id]?.kind !== 'skipped')
  const approvableCount = visible.filter(p => {
    const s = states[p.id]
    return s?.kind === 'pending' && p.proposedTeacher && p.proposedSlots.length === p.sessionsPerWeek
  }).length

  if (proposals.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-purple-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-emerald-900 text-lg">⚡ Smart Suggestions</h2>
          <p className="text-sm text-emerald-700 mt-0.5">
            {visible.length} proposed group{visible.length !== 1 ? 's' : ''} · ranked by overlap + teacher load
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-semibold text-emerald-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requireAcceptance}
              onChange={e => setRequireAcceptance(e.target.checked)}
              className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-400"
            />
            Require teacher to accept
          </label>
          {approvableCount > 1 && (
            <button
              onClick={approveAll}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Working…' : `Approve All (${approvableCount})`}
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {visible.map(p => {
          const state = states[p.id]
          const teacherId = overrideTeacher[p.id] ?? p.proposedTeacher?.id
          const activeTeacher =
            teacherId === p.proposedTeacher?.id ? p.proposedTeacher
            : p.alternatives.find(a => a.id === teacherId) ?? null

          if (state?.kind === 'approved') {
            return (
              <div key={p.id} className="px-6 py-4 bg-emerald-50/50 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">✓</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">Group created</p>
                  <p className="text-xs text-emerald-700">{p.courseName} · {p.enrollments.length} student{p.enrollments.length !== 1 ? 's' : ''} · {activeTeacher?.name}</p>
                </div>
              </div>
            )
          }

          const blocked = !p.proposedTeacher || p.proposedSlots.length !== p.sessionsPerWeek

          return (
            <div key={p.id} className="px-4 sm:px-6 py-5 space-y-4">
              {/* Header row: course + status + close */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{p.courseName}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{p.courseLanguage}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">{p.courseLevel}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.enrollments.length} of max {p.maxGroupSize} student{p.maxGroupSize !== 1 ? 's' : ''} · {p.sessionsPerWeek}× per week × {p.durationWeeks} wks
                  </p>
                </div>
                <button
                  onClick={() => skip(p)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1"
                >
                  Skip
                </button>
              </div>

              {/* Students */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Students</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.enrollments.map(s => (
                    <div key={s.enrollmentId} className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-700">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher + alternatives */}
              {p.proposedTeacher ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Suggested Teacher</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setOverrideTeacher(prev => ({ ...prev, [p.id]: p.proposedTeacher!.id }))}
                      className={`flex items-center gap-2 rounded-xl border-2 pl-1 pr-3 py-1 transition-all ${
                        teacherId === p.proposedTeacher.id ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                        {p.proposedTeacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{p.proposedTeacher.name}</p>
                        <p className="text-[10px] text-gray-500 leading-tight">{p.proposedTeacher.overlap} overlap · {p.proposedTeacher.load} active</p>
                      </div>
                    </button>
                    {p.alternatives.map(alt => (
                      <button
                        key={alt.id}
                        onClick={() => setOverrideTeacher(prev => ({ ...prev, [p.id]: alt.id }))}
                        className={`flex items-center gap-2 rounded-xl border-2 pl-1 pr-3 py-1 transition-all ${
                          teacherId === alt.id ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                          {alt.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900 leading-tight">{alt.name}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">{alt.overlap} overlap · {alt.load} active</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  ⚠ {p.reason ?? 'No suitable teacher found.'}
                </div>
              )}

              {/* Slots preview */}
              {p.proposedSlots.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Proposed Schedule ({p.proposedSlots.length} of {p.sessionsPerWeek} needed)
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const localSlots = utcSlotsToLocal(p.proposedSlots, timezone)
                      return p.proposedSlots.map((utcSlot, i) => {
                        const localKey = localSlots[i] ?? utcSlot
                        const [day, time] = localKey.split('-')
                        return (
                          <span key={utcSlot} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg font-semibold">
                            {DAY_LABEL[day] ?? day} {time}
                          </span>
                        )
                      })
                    })()}
                  </div>
                  <p className="text-[10px] text-gray-400">Times shown in {timezone}</p>
                </div>
              ) : null}

              {/* Error */}
              {state?.kind === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  ✗ {state.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => approve(p)}
                  disabled={blocked || state?.kind === 'submitting'}
                  className="px-5 py-2 rounded-xl bg-[#6c4ff5] text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5c3de8] transition-colors shadow-md"
                >
                  {state?.kind === 'submitting' ? 'Creating…' : '✓ Approve & Publish'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

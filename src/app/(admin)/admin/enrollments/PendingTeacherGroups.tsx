'use client'
import { useTransition, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cancelPendingProposal, reassignGroupTeacher } from '@/lib/admin/actions'
import { utcSlotsToLocal } from '@/lib/availability'

type Member = {
  user_id: string
  name: string
  avatar_url: string | null
  availability: string[]
}

type DeclinedTeacher = {
  teacher_id: string
  teacher_name: string
  reason: string | null
  declined_at: string
}

type EligibleTeacher = {
  id: string
  name: string
  activeGroupCount: number
  availability: string[]
  occupiedSlots: string[]
}

export type PendingTeacherGroupRow = {
  id: string
  proposed_at: string | null
  acceptance_status: 'pending_teacher' | 'declined'
  course_id: string
  course_name: string
  course_language: string
  course_level: string
  sessions_per_week: number
  teacher_id: string
  teacher_name: string
  members: Member[]
  session_count: number
  declined_teachers: DeclinedTeacher[]
  eligible_teachers: EligibleTeacher[]
}

export function PendingTeacherGroups({ groups }: { groups: PendingTeacherGroupRow[] }) {
  const router = useRouter()

  if (groups.length === 0) return null

  const pendingCount = groups.filter(g => g.acceptance_status === 'pending_teacher').length
  const declinedCount = groups.filter(g => g.acceptance_status === 'declined').length

  return (
    <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <h2 className="font-bold text-amber-900 text-lg">Proposal Status</h2>
            <p className="text-sm text-amber-700 mt-0.5">
              {pendingCount > 0 && `${pendingCount} awaiting response`}
              {pendingCount > 0 && declinedCount > 0 && ' · '}
              {declinedCount > 0 && `${declinedCount} declined — needs new teacher`}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {groups.map(g =>
          g.acceptance_status === 'declined'
            ? <DeclinedCard key={g.id} group={g} onDone={() => router.refresh()} />
            : <PendingCard key={g.id} group={g} onDone={() => router.refresh()} />
        )}
      </div>
    </div>
  )
}

// ── Pending card ──────────────────────────────────────────────────────────────

function PendingCard({ group: g, onDone }: { group: PendingTeacherGroupRow; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelPendingProposal(g.id)
      if (res?.error) setError(res.error)
      else onDone()
    })
  }

  return (
    <div className="px-4 sm:px-6 py-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <CourseBadges name={g.course_name} language={g.course_language} level={g.course_level} />
          <div className="flex items-center gap-1.5 mt-1">
            <MiniAvatar name={g.teacher_name} color="emerald" />
            <p className="text-sm text-gray-600">
              Proposed to <span className="font-semibold text-gray-800">{g.teacher_name}</span>
            </p>
            {g.proposed_at && (
              <span className="text-xs text-gray-400">
                · {new Date(g.proposed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full flex-shrink-0">
          <PulsingDot />
          Pending response
        </span>
      </div>

      <MemberList members={g.members} sessionCount={g.session_count} />
      {error && <ErrorBox message={error} />}

      <div className="flex items-center justify-end gap-2 pt-1">
        <p className="flex-1 text-xs text-gray-400">Teacher will see this in their Proposals tab</p>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Cancelling…' : 'Cancel & Reassign'}
        </button>
      </div>
    </div>
  )
}

// ── Declined card — two-step ──────────────────────────────────────────────────

function DeclinedCard({ group: g, onDone }: { group: PendingTeacherGroupRow; onDone: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [requireAcceptance, setRequireAcceptance] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => { setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) }, [])

  const selectedTeacher = g.eligible_teachers.find(t => t.id === selectedTeacherId) ?? null

  // Overlap: teacher availability ∩ all students' availability (UTC slots)
  const overlapSlots: string[] = selectedTeacher
    ? selectedTeacher.availability.filter(slot =>
        g.members.every(m => (m.availability ?? []).includes(slot))
      )
    : []

  const occupiedSet = new Set(selectedTeacher?.occupiedSlots ?? [])
  // Slots overlap but teacher already has them booked in another group
  const bookedOverlap = overlapSlots.filter(s => occupiedSet.has(s))
  // Slots overlap and teacher is free — these are selectable
  const freeOverlap = overlapSlots.filter(s => !occupiedSet.has(s))

  const localFreeLabels = utcSlotsToLocal(freeOverlap, timezone)
  const localBookedLabels = utcSlotsToLocal(bookedOverlap, timezone)

  function toggleSlot(slot: string) {
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (next.has(slot)) next.delete(slot)
      else next.add(slot)
      return next
    })
  }

  function handleAssign() {
    const slots = [...selectedSlots]
    if (slots.length !== g.sessions_per_week) {
      setError(`Select exactly ${g.sessions_per_week} slot${g.sessions_per_week !== 1 ? 's' : ''}`)
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await reassignGroupTeacher(g.id, selectedTeacherId, slots, requireAcceptance)
      if (res?.error) setError(res.error)
      else onDone()
    })
  }

  return (
    <div className="px-4 sm:px-6 py-5 space-y-4 bg-red-50/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <CourseBadges name={g.course_name} language={g.course_language} level={g.course_level} />
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold text-red-700">{g.declined_teachers.length} teacher{g.declined_teachers.length !== 1 ? 's' : ''} declined</span>
            {' — '}students need a new teacher
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-full flex-shrink-0">
          ❌ Declined
        </span>
      </div>

      {/* Declined history */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Declined By</p>
        {g.declined_teachers.map((d, i) => (
          <div key={i} className="flex items-start gap-2 bg-white rounded-xl border border-red-100 px-3 py-2">
            <MiniAvatar name={d.teacher_name} color="red" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800">{d.teacher_name}</p>
              {d.reason && <p className="text-xs text-gray-500 mt-0.5 italic">&ldquo;{d.reason}&rdquo;</p>}
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date(d.declined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <MemberList members={g.members} sessionCount={g.session_count} />

      {/* Step indicator */}
      {g.eligible_teachers.length > 0 && (
        <div className="flex items-center gap-2">
          <StepBadge n={1} active={step === 1} done={step === 2} label="Select Teacher" />
          <div className="flex-1 h-px bg-gray-200" />
          <StepBadge n={2} active={step === 2} done={false} label="Select Slots" />
        </div>
      )}

      {/* No eligible teachers */}
      {g.eligible_teachers.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-sm text-amber-800">
          ⚠ No eligible teachers — all approved teachers for this course have declined.
          Approve a new teacher request for this course first.
        </div>
      )}

      {/* Step 1: Teacher picker */}
      {g.eligible_teachers.length > 0 && step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Choose New Teacher</p>
          <div className="space-y-2">
            {g.eligible_teachers.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeacherId(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                  selectedTeacherId === t.id
                    ? 'border-[#6c4ff5] bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <MiniAvatar name={t.name} color="purple" size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.activeGroupCount} active group{t.activeGroupCount !== 1 ? 's' : ''}</p>
                </div>
                {selectedTeacherId === t.id && (
                  <span className="text-[#6c4ff5] text-sm font-bold flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => { setError(null); setSelectedSlots(new Set()); setStep(2) }}
              disabled={!selectedTeacherId}
              className="px-5 py-2 rounded-xl bg-[#6c4ff5] text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5c3de8] transition-colors"
            >
              Next: Choose Slots →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Slot picker */}
      {g.eligible_teachers.length > 0 && step === 2 && selectedTeacher && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Choose {g.sessions_per_week} Slot{g.sessions_per_week !== 1 ? 's' : ''} — overlapping with all students
            </p>
            <button onClick={() => { setStep(1); setSelectedSlots(new Set()) }} className="text-xs text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mb-1">
            <MiniAvatar name={selectedTeacher.name} color="purple" />
            <p className="text-xs font-semibold text-gray-700">{selectedTeacher.name}</p>
          </div>

          {overlapSlots.length === 0 ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-sm text-amber-800">
              ⚠ No overlapping slots between {selectedTeacher.name} and all students. Go back and choose a different teacher.
            </div>
          ) : freeOverlap.length === 0 ? (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-3 text-sm text-red-700">
                ⚠ All overlapping slots are already booked by {selectedTeacher.name} in other groups. Go back and choose a different teacher.
              </div>
              {bookedOverlap.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Already booked in other groups</p>
                  <div className="flex flex-wrap gap-2">
                    {bookedOverlap.map((utcSlot, i) => {
                      const label = localBookedLabels[i] ?? utcSlot
                      const [day, time] = label.split('-')
                      return (
                        <span key={utcSlot} className="px-3 py-2 rounded-xl border-2 border-red-100 bg-red-50 text-sm font-semibold text-red-300 line-through cursor-not-allowed">
                          {day} {time}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400">Times in {timezone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selectable free slots */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Available — select {g.sessions_per_week}
                </p>
                <div className="flex flex-wrap gap-2">
                  {freeOverlap.map((utcSlot, i) => {
                    const label = localFreeLabels[i] ?? utcSlot
                    const [day, time] = label.split('-')
                    const checked = selectedSlots.has(utcSlot)
                    const atLimit = selectedSlots.size >= g.sessions_per_week && !checked
                    return (
                      <button
                        key={utcSlot}
                        onClick={() => !atLimit && toggleSlot(utcSlot)}
                        disabled={atLimit}
                        className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          checked
                            ? 'border-[#6c4ff5] bg-purple-50 text-[#6c4ff5]'
                            : atLimit
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 hover:border-purple-200 text-gray-700'
                        }`}
                      >
                        {day} {time}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-gray-400">Times in {timezone} · {selectedSlots.size}/{g.sessions_per_week} selected</p>
              </div>

              {/* Already-booked slots (informational) */}
              {bookedOverlap.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Already booked in other groups — not selectable</p>
                  <div className="flex flex-wrap gap-2">
                    {bookedOverlap.map((utcSlot, i) => {
                      const label = localBookedLabels[i] ?? utcSlot
                      const [day, time] = label.split('-')
                      return (
                        <span key={utcSlot} className="px-3 py-2 rounded-xl border-2 border-red-100 bg-red-50 text-sm font-semibold text-red-300 line-through">
                          {day} {time}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {freeOverlap.length >= g.sessions_per_week && (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={requireAcceptance}
                  onChange={e => setRequireAcceptance(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#6c4ff5] focus:ring-purple-400"
                />
                Require teacher to accept before going live
              </label>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleAssign}
                  disabled={isPending || selectedSlots.size !== g.sessions_per_week}
                  className="px-5 py-2 rounded-xl bg-[#6c4ff5] text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5c3de8] transition-colors shadow-md"
                >
                  {isPending ? 'Assigning…' : requireAcceptance ? '📨 Send New Proposal' : '✓ Assign Teacher'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {error && <ErrorBox message={error} />}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function StepBadge({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-[#6c4ff5] text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-[#6c4ff5]' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

function CourseBadges({ name, language, level }: { name: string; language: string; level: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p className="font-bold text-gray-900">{name}</p>
      {language && <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">{language}</span>}
      {level && <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">{level}</span>}
    </div>
  )
}

function MiniAvatar({ name, color, size = 'sm' }: { name: string; color: 'emerald' | 'red' | 'purple'; size?: 'sm' | 'lg' }) {
  const cls = { emerald: 'from-emerald-400 to-teal-500', red: 'from-red-400 to-rose-500', purple: 'from-[#6c4ff5] to-indigo-500' }[color]
  const sz = size === 'lg' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${cls} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function MemberList({ members, sessionCount }: { members: Member[]; sessionCount: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Students</span>
      <div className="flex items-center gap-2 flex-wrap">
        {members.map(m => (
          <div key={m.user_id} className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-gray-100">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-700">{m.name}</span>
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400">· {sessionCount} session{sessionCount !== 1 ? 's' : ''} scheduled</span>
    </div>
  )
}

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
    </span>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">✗ {message}</div>
  )
}

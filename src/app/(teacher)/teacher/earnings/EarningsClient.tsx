'use client'
import { useState, useTransition } from 'react'
import { requestPayout } from '@/lib/teacher/phase4-actions'

type CourseEarning = {
  groupId: string
  courseName: string
  language: string
  price: number
  sharePerStudent: number
  paidStudents: number
  earning: number
  completed: boolean
  completedSessions: number
  totalSessions: number
}

type PayoutItem = {
  id: string; amount: number; status: string
  payout_date: string | null; method: string | null; created_at: string
}

const MIN_PAYOUT = 1000 // Rs

const STATUS_BADGE: Record<string, string> = {
  paid:       'bg-emerald-100 text-emerald-700',
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  failed:     'bg-red-100 text-red-600',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function pkr(n: number) {
  return 'Rs ' + Number(n).toLocaleString()
}

type Props = {
  courses: CourseEarning[]
  payouts: PayoutItem[]
  pendingTotal: number
  earnedTotal: number
  totalPaid: number
  available: number
}

export function EarningsClient({ courses, payouts, pendingTotal, earnedTotal, totalPaid, available }: Props) {
  const [requesting, startRequest] = useTransition()
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)

  function handleRequestPayout() {
    if (available < MIN_PAYOUT) return
    startRequest(async () => {
      const res = await requestPayout(available)
      setPayoutMsg(res.error ? `Error: ${res.error}` : 'Payout request submitted! Admin will process it shortly.')
      setTimeout(() => setPayoutMsg(null), 5000)
    })
  }

  const completedCourses = courses.filter(c => c.completed && c.paidStudents > 0)
  const pendingCourses = courses.filter(c => !c.completed && c.paidStudents > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Earnings & Payouts</h1>
        <p className="text-sm text-gray-400 mt-1">
          You earn <span className="font-semibold text-gray-700">70%</span> of each course&apos;s fee per paid student — withdrawable once the course is completed.
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available to withdraw', value: pkr(available),     icon: '💸', color: 'from-emerald-500 to-teal-500' },
          { label: 'Pending (in progress)', value: pkr(pendingTotal),  icon: '⏳', color: 'from-amber-500 to-orange-500' },
          { label: 'Total earned',          value: pkr(earnedTotal),   icon: '💰', color: 'from-purple-500 to-indigo-500' },
          { label: 'Total paid out',        value: pkr(totalPaid),     icon: '✅', color: 'from-blue-500 to-cyan-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Payout request banner ── */}
      {available >= MIN_PAYOUT ? (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-lg">Ready to withdraw!</p>
            <p className="text-emerald-100 text-sm mt-0.5">You have <strong className="text-white">{pkr(available)}</strong> from completed courses available for payout.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            {payoutMsg && <p className="text-xs text-white/90 max-w-xs text-right">{payoutMsg}</p>}
            <button onClick={handleRequestPayout} disabled={requesting}
              className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-40 shadow-md">
              {requesting ? 'Sending request…' : '💸 Request payout'}
            </button>
          </div>
        </div>
      ) : available > 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-800">Not yet eligible</p>
            <p className="text-sm text-amber-600 mt-0.5">Minimum payout is {pkr(MIN_PAYOUT)}. You have {pkr(available)} available.</p>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Course breakdown (2/3 wide) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-sm">Course earnings</h2>
            </div>

            {completedCourses.length === 0 && pendingCourses.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-sm text-gray-400">No paid enrollments in your courses yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Available (completed) courses first */}
                {completedCourses.map(c => (
                  <CourseRow key={c.groupId} c={c} />
                ))}
                {pendingCourses.map(c => (
                  <CourseRow key={c.groupId} c={c} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Payout history (1/3) ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-sm">Payout history</h2>
            </div>

            {payouts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">💳</p>
                <p className="text-sm text-gray-400">No payouts yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {payouts.map(p => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{pkr(p.amount)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(p.created_at)}</p>
                        {p.method && <p className="text-xs text-gray-400 capitalize">{p.method.replace('_', ' ')}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_BADGE[p.status] ?? STATUS_BADGE.pending}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseRow({ c }: { c: CourseEarning }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center text-sm flex-shrink-0">🎓</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{c.courseName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {c.language} · {c.paidStudents} paid student{c.paidStudents !== 1 ? 's' : ''} · 70% × {pkr(c.price)}
          </p>
          {!c.completed && (
            <p className="text-[11px] text-amber-600 mt-1">
              ⏳ Locked — you can withdraw once this course is completed.
            </p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${c.completed ? 'text-emerald-600' : 'text-gray-400'}`}>
          {c.completed ? '+' : ''}{pkr(c.earning)}
        </p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {c.completed ? 'Available' : 'Pending'}
        </span>
      </div>
    </div>
  )
}

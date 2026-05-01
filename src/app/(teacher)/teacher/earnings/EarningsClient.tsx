'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { requestPayout } from '@/lib/teacher/phase4-actions'

type SessionItem = {
  id: string; scheduled_at: string; duration_minutes: number
  course_name: string; language: string; earned: number
}

type PayoutItem = {
  id: string; amount: number; status: string
  payout_date: string | null; method: string | null; created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  paid:       'bg-emerald-100 text-emerald-700',
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  failed:     'bg-red-100 text-red-600',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

type Props = {
  sessions: SessionItem[]
  payouts: PayoutItem[]
  rate: number
  totalPaid: number
}

export function EarningsClient({ sessions, payouts, rate, totalPaid }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [requesting, startRequest] = useTransition()
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)

  // Unique months for filter
  const months = Array.from(new Set(sessions.map(s => s.scheduled_at.slice(0, 7)))).sort().reverse()

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.scheduled_at.startsWith(filter))

  // Earnings calculations
  const totalEarned = sessions.length * rate
  const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((a, p) => a + p.amount, 0)
  const pendingBalance = totalEarned - totalPaid - pendingPayouts

  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
  const thisMonthEarned = sessions.filter(s => s.scheduled_at.startsWith(thisMonth)).length * rate
  const lastMonthEarned = sessions.filter(s => s.scheduled_at.startsWith(lastMonth)).length * rate

  function handleRequestPayout() {
    if (pendingBalance < 50) return
    startRequest(async () => {
      const res = await requestPayout(pendingBalance)
      setPayoutMsg(res.error ? `Error: ${res.error}` : 'Payout request submitted! Admin will process it shortly.')
      setTimeout(() => setPayoutMsg(null), 5000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-sm text-gray-400 mt-1">Rate: <span className="font-semibold text-gray-700">${rate}/session</span></p>
        </div>
        <Link href="/teacher/profile" className="self-start sm:self-auto text-sm text-[#6c4ff5] font-semibold hover:underline">
          Update rate →
        </Link>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total earned',    value: `$${totalEarned.toFixed(2)}`,       icon: '💰', color: 'from-purple-500 to-indigo-500' },
          { label: 'This month',      value: `$${thisMonthEarned.toFixed(2)}`,   icon: '📅', color: 'from-blue-500 to-cyan-500' },
          { label: 'Last month',      value: `$${lastMonthEarned.toFixed(2)}`,   icon: '📆', color: 'from-teal-500 to-emerald-500' },
          { label: 'Pending balance', value: `$${pendingBalance.toFixed(2)}`,    icon: '⏳', color: 'from-amber-500 to-orange-500' },
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
      {pendingBalance >= 50 ? (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-lg">Ready to withdraw!</p>
            <p className="text-emerald-100 text-sm mt-0.5">You have <strong className="text-white">${pendingBalance.toFixed(2)}</strong> available for payout.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            {payoutMsg && <p className="text-xs text-white/90 max-w-xs text-right">{payoutMsg}</p>}
            <button onClick={handleRequestPayout} disabled={requesting}
              className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-40 shadow-md">
              {requesting ? 'Sending request…' : '💸 Request payout'}
            </button>
          </div>
        </div>
      ) : pendingBalance > 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-800">Not yet eligible</p>
            <p className="text-sm text-amber-600 mt-0.5">Minimum payout is $50. You have ${pendingBalance.toFixed(2)} — need ${(50 - pendingBalance).toFixed(2)} more.</p>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Session breakdown (2/3 wide) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-gray-900 text-sm">Session breakdown <span className="text-gray-400 font-normal">({filtered.length} sessions)</span></h2>
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                <option value="all">All time</option>
                {months.map(m => <option key={m} value={m}>{fmtMonth(m + '-01')}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-sm text-gray-400">No completed sessions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center text-sm flex-shrink-0">🎥</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.course_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(s.scheduled_at)} · {s.duration_minutes} min · {s.language}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex-shrink-0">+${s.earned.toFixed(2)}</span>
                  </div>
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
                        <p className="text-sm font-bold text-gray-900">${p.amount.toFixed(2)}</p>
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

          {/* Bank details placeholder */}
          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Payment method</p>
            <p className="text-sm text-purple-700">Payouts are processed manually by the admin team via bank transfer.</p>
            <p className="text-xs text-purple-500 mt-2">Stripe Connect automated payouts coming in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

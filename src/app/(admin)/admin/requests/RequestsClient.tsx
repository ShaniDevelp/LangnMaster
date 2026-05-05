'use client'

import { useState, useTransition } from 'react'
import { processPayout, resolveGroupAction } from '@/lib/admin/phase4-actions'

type Payout = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  payout_date: string | null
  method: string | null
  created_at: string
  profiles?: { name?: string; avatar_url?: string | null }
}

type GroupAction = {
  id: string
  type: 'pause' | 'student_reassignment' | 'other'
  notes: string | null
  status: 'pending' | 'resolved' | 'rejected'
  created_at: string
  profiles?: { name?: string; avatar_url?: string | null }
  groups?: { courses?: { name?: string } }
}

type CourseRequest = {
  id: string
  course_id: string
  teacher_id: string
  status: 'pending' | 'approved' | 'rejected'
  profiles?: { name?: string; avatar_url?: string | null }
  courses?: { name?: string; language?: string }
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-gray-100 text-gray-500',
}

import { resolveTeacherCourseRequest } from '@/lib/admin/actions'

export function RequestsClient({ payouts, groupActions, courseRequests }: { payouts: Payout[], groupActions: GroupAction[], courseRequests: CourseRequest[] }) {
  const [tab, setTab] = useState<'payouts' | 'actions' | 'courses'>('courses')
  const [isPending, startTransition] = useTransition()

  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const pendingActions = groupActions.filter(a => a.status === 'pending')
  const pendingCourses = courseRequests.filter(c => c.status === 'pending')

  function handleProcessPayout(id: string, status: 'paid' | 'failed') {
    startTransition(async () => {
      await processPayout(id, status)
    })
  }

  function handleResolveAction(id: string, status: 'resolved' | 'rejected') {
    startTransition(async () => {
      await resolveGroupAction(id, status)
    })
  }

  function handleResolveCourseRequest(id: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      await resolveTeacherCourseRequest(id, status)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage teacher requests and payouts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { k: 'courses' as const, l: `Course Requests (${pendingCourses.length} pending)` },
          { k: 'payouts' as const, l: `Payouts (${pendingPayouts.length} pending)` },
          { k: 'actions' as const, l: `Group Actions (${pendingActions.length} pending)` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'payouts' && (
        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-5xl mb-4">💸</p>
              <p className="text-lg font-bold text-gray-700">No payout requests</p>
              <p className="text-sm text-gray-400 mt-2">When teachers request earnings, they appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teacher</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payouts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {p.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <span className="font-medium text-gray-900">{p.profiles?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">${p.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {p.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button disabled={isPending} onClick={() => handleProcessPayout(p.id, 'paid')}
                                className="px-3 py-1.5 rounded-lg bg-[#6c4ff5] text-white text-xs font-bold hover:bg-[#5c3de8] transition-colors disabled:opacity-40">
                                Mark Paid
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'actions' && (
        <div className="space-y-4">
          {groupActions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-5xl mb-4">⚙️</p>
              <p className="text-lg font-bold text-gray-700">No action requests</p>
              <p className="text-sm text-gray-400 mt-2">When teachers request a group pause or reassignment, they appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groupActions.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg flex-shrink-0">⚙️</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
                        <span className="text-sm font-bold text-gray-900">{a.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-700"><span className="font-semibold">{a.profiles?.name}</span> requested action for <span className="font-semibold">{a.groups?.courses?.name}</span></p>
                      {a.notes && <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">&quot;{a.notes}&quot;</p>}
                      <p className="text-xs text-gray-400 mt-2">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button disabled={isPending} onClick={() => handleResolveAction(a.id, 'rejected')}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40">
                        Dismiss
                      </button>
                      <button disabled={isPending} onClick={() => handleResolveAction(a.id, 'resolved')}
                        className="px-4 py-2 rounded-xl bg-[#6c4ff5] text-white text-xs font-bold hover:bg-[#5c3de8] transition-colors disabled:opacity-40 shadow-sm">
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div className="space-y-4">
          {courseRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg font-bold text-gray-700">No course requests</p>
              <p className="text-sm text-gray-400 mt-2">When teachers request to teach a new course, they appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courseRequests.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 text-lg flex-shrink-0">🎓</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
                        <span className="text-sm font-bold text-gray-900">TEACHING REQUEST</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{c.profiles?.name}</span> requested to teach <span className="font-semibold">{c.courses?.name}</span> ({c.courses?.language})
                      </p>
                    </div>
                  </div>
                  {c.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button disabled={isPending} onClick={() => handleResolveCourseRequest(c.id, 'rejected')}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-40">
                        Reject
                      </button>
                      <button disabled={isPending} onClick={() => handleResolveCourseRequest(c.id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40 shadow-sm">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

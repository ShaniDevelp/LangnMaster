import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Profile, Enrollment, Group } from '@/lib/supabase/types'

type StatCard = { label: string; value: number | string; icon: string; href: string; color: string }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: pendingEnrollments },
    { count: activeGroups },
    { count: totalSessions },
    { data: enrollmentsWithPrice },
    { data: pendingPayouts },
    { data: pendingGroupActions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('courses(price_usd)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('teacher_payouts').select('id, amount, teacher_id, profiles:teacher_id(name)').eq('status', 'pending'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('group_action_requests').select('id, type, group_id, teacher_id, groups(courses(name)), profiles:teacher_id(name)').eq('status', 'pending')
  ])

  // Financial Stats
  const rawEnrollments = (enrollmentsWithPrice ?? []) as unknown as { courses: { price_usd: number } | null }[]
  const totalRevenue = rawEnrollments.reduce((acc, e) => acc + (e.courses?.price_usd ?? 0), 0)

  const payouts = (pendingPayouts ?? []) as { id: string; amount: number; profiles?: { name?: string } }[]
  const totalPendingPayoutsAmount = payouts.reduce((acc, p) => acc + p.amount, 0)

  const groupActions = (pendingGroupActions ?? []) as { 
    id: string; type: string; 
    profiles?: { name?: string }; 
    groups?: { courses?: { name?: string } } 
  }[]

  const stats: StatCard[] = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💳', href: '#', color: 'from-emerald-500 to-teal-500' },
    { label: 'Students', value: totalStudents ?? 0, icon: '🎓', href: '/admin/students', color: 'from-blue-500 to-indigo-500' },
    { label: 'Teachers', value: totalTeachers ?? 0, icon: '👨‍🏫', href: '/admin/teachers', color: 'from-cyan-500 to-blue-500' },
    { label: 'Active Groups', value: activeGroups ?? 0, icon: '👥', href: '/admin/groups', color: 'from-purple-500 to-[#6c4ff5]' },
    { label: 'Total Sessions', value: totalSessions ?? 0, icon: '📅', href: '/admin/groups', color: 'from-pink-500 to-rose-500' },
  ]

  const hasAlerts = (pendingEnrollments ?? 0) > 0 || payouts.length > 0 || groupActions.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Action Alerts ── */}
      {hasAlerts && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-amber-50/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="text-sm">⚠️</span>
            </div>
            <h2 className="font-bold text-amber-900">Requires Attention</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {/* Payouts */}
            {payouts.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">💸</div>
                  <div>
                    <p className="font-semibold text-gray-900">{payouts.length} Pending Payout{payouts.length !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-gray-500">Teachers have requested a total of <span className="font-semibold text-gray-900">${totalPendingPayoutsAmount.toFixed(2)}</span>.</p>
                  </div>
                </div>
                <Link href="/admin/payouts" className="text-sm font-semibold text-[#6c4ff5] bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors whitespace-nowrap">
                  Review payouts
                </Link>
              </div>
            )}

            {/* Group Actions */}
            {groupActions.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">⚙️</div>
                  <div>
                    <p className="font-semibold text-gray-900">{groupActions.length} Group Action Request{groupActions.length !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-gray-500">Teachers requested pauses or reassignments.</p>
                  </div>
                </div>
                <Link href="/admin/requests" className="text-sm font-semibold text-[#6c4ff5] bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors whitespace-nowrap">
                  View requests
                </Link>
              </div>
            )}

            {/* Pending Enrollments */}
            {(pendingEnrollments ?? 0) > 0 && (
              <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">⏳</div>
                  <div>
                    <p className="font-semibold text-gray-900">{pendingEnrollments} Pending Enrollment{pendingEnrollments !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-gray-500">Students are waiting to be assigned to groups.</p>
                  </div>
                </div>
                <Link href="/admin/enrollments" className="text-sm font-semibold text-white bg-[#6c4ff5] px-4 py-2 rounded-xl hover:bg-[#5c3de8] transition-colors shadow-sm whitespace-nowrap">
                  Assign Groups Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className={s.href === '#' ? 'pointer-events-none' : ''}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group h-full">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 group-hover:text-[#6c4ff5] transition-colors">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}

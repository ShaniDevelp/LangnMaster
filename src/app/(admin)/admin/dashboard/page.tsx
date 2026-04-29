import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Profile, Enrollment, Group, Session } from '@/lib/supabase/types'

type StatCard = { label: string; value: number | string; icon: string; href: string; color: string }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: pendingEnrollments },
    { count: activeGroups },
    { count: totalSessions },
    { data: recentEnrollmentsRaw },
    { data: recentGroupsRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments')
      .select('*, profiles:user_id(name), courses(name)')
      .eq('status', 'pending')
      .order('enrolled_at', { ascending: false })
      .limit(5),
    supabase.from('groups')
      .select('*, courses(name), profiles:teacher_id(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  type EnrollmentRow = Enrollment & {
    profiles: Pick<Profile, 'name'> | null
    courses: { name: string } | null
  }
  type GroupRow = Group & {
    courses: { name: string } | null
    profiles: Pick<Profile, 'name'> | null
  }

  const recentEnrollments = (recentEnrollmentsRaw ?? []) as unknown as EnrollmentRow[]
  const recentGroups = (recentGroupsRaw ?? []) as unknown as GroupRow[]

  const stats: StatCard[] = [
    { label: 'Students', value: totalStudents ?? 0, icon: '🎓', href: '/admin/students', color: 'from-blue-500 to-indigo-500' },
    { label: 'Teachers', value: totalTeachers ?? 0, icon: '👨‍🏫', href: '/admin/teachers', color: 'from-emerald-500 to-teal-500' },
    { label: 'Pending Enrollments', value: pendingEnrollments ?? 0, icon: '⏳', href: '/admin/enrollments', color: 'from-amber-400 to-orange-500' },
    { label: 'Active Groups', value: activeGroups ?? 0, icon: '👥', href: '/admin/groups', color: 'from-purple-500 to-[#6c4ff5]' },
    { label: 'Total Sessions', value: totalSessions ?? 0, icon: '📅', href: '/admin/groups', color: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {(pendingEnrollments ?? 0) > 0 && (
          <Link
            href="/admin/enrollments"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pendingEnrollments} pending
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 group-hover:text-[#6c4ff5] transition-colors">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending enrollments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Pending Enrollments</h2>
            <Link href="/admin/enrollments" className="text-sm text-[#6c4ff5] font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentEnrollments.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">No pending enrollments</p>
            ) : recentEnrollments.map(e => (
              <div key={e.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {e.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.profiles?.name}</p>
                    <p className="text-xs text-gray-400">{e.courses?.name}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">pending</span>
              </div>
            ))}
          </div>
          {recentEnrollments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <Link
                href="/admin/enrollments"
                className="w-full flex items-center justify-center gap-2 bg-[#6c4ff5] text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-[#5c3de8] transition-colors"
              >
                ⚡ Assign Groups Now
              </Link>
            </div>
          )}
        </div>

        {/* Recent groups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Groups</h2>
            <Link href="/admin/groups" className="text-sm text-[#6c4ff5] font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentGroups.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">No groups yet</p>
            ) : recentGroups.map(g => (
              <div key={g.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.courses?.name}</p>
                  <p className="text-xs text-gray-400">Teacher: {g.profiles?.name ?? 'Unassigned'}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

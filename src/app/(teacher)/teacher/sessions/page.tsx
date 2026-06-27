import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherSessionsClient } from './TeacherSessionsClient'

export default async function TeacherSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('id')
    .eq('teacher_id', user.id)
    .neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')
  const groupIds = ((groupsRaw ?? []) as { id: string }[]).map(g => g.id)

  let sessions: any[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select(`
        *,
        groups (
          *,
          week_start,
          courses (name, language, level, sessions_per_week, duration_weeks),
          group_members (user_id, profiles:user_id (id, name, avatar_url))
        )
      `)
      .in('group_id', groupIds)
      .order('scheduled_at', { ascending: false })
    sessions = data ?? []
  }

  // Build groupId → unpaid student names map (admin client bypasses RLS)
  const groupUnpaidStudents: Record<string, string[]> = {}
  const memberPairs: { user_id: string; course_id: string; group_id: string; name: string }[] = []
  for (const s of sessions) {
    const g = s.groups as any
    if (!g?.group_members || !g?.course_id) continue
    for (const m of g.group_members) {
      memberPairs.push({
        user_id: m.user_id,
        course_id: g.course_id,
        group_id: s.group_id,
        name: m.profiles?.name?.split(' ')[0] ?? 'Student',
      })
    }
  }
  if (memberPairs.length > 0) {
    const adminClient = createAdminClient()
    const userIds = [...new Set(memberPairs.map(p => p.user_id))]
    const { data: payments } = await (adminClient as any)
      .from('enrollments')
      .select('user_id, course_id, payment_status')
      .in('user_id', userIds)
    const paymentMap = new Map<string, string>(
      ((payments ?? []) as { user_id: string; course_id: string; payment_status: string }[])
        .map((e: any) => [`${e.user_id}:${e.course_id}`, e.payment_status])
    )
    for (const p of memberPairs) {
      if (paymentMap.get(`${p.user_id}:${p.course_id}`) !== 'paid') {
        if (!groupUnpaidStudents[p.group_id]) groupUnpaidStudents[p.group_id] = []
        if (!groupUnpaidStudents[p.group_id].includes(p.name)) {
          groupUnpaidStudents[p.group_id].push(p.name)
        }
      }
    }
  }

  const upcomingCount = sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length
  const completedCount = sessions.filter(s => s.status === 'completed').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage teaching sessions, view prep materials, and recap class notes.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#6c4ff5] rounded-full" />
            <span>{upcomingCount} upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span>{completedCount} completed</span>
          </div>
        </div>
      </div>

      <TeacherSessionsClient sessions={sessions} groupUnpaidStudents={groupUnpaidStudents} />
    </div>
  )
}

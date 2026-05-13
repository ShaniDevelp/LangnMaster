import { createClient } from '@/lib/supabase/server'
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
          group_members (user_id, profiles:user_id (id, name))
        )
      `)
      .in('group_id', groupIds)
      .order('scheduled_at', { ascending: false })
    sessions = data ?? []
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

      <TeacherSessionsClient sessions={sessions} />
    </div>
  )
}

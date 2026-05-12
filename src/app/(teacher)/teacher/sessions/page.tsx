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
          courses (name, language, level)
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Class Schedule</h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage your teaching sessions, view student prep materials, and recap class notes.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5 text-indigo-600">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            {upcomingCount} Scheduled
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 bg-gray-200 rounded-full" />
            {completedCount} History
          </div>
        </div>
      </div>

      <TeacherSessionsClient sessions={sessions} />
    </div>
  )
}

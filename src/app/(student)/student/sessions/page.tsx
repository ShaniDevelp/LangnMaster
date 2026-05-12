import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentSessionsClient } from './StudentSessionsClient'

export default async function StudentSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberGroupsRaw } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const allGroupIds = ((memberGroupsRaw ?? []) as { group_id: string }[]).map(m => m.group_id)

  // Exclude groups still pending teacher acceptance
  const { data: acceptedGroupsRaw } = allGroupIds.length > 0
    ? await supabase.from('groups').select('id').in('id', allGroupIds).neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')
    : { data: [] }
  const groupIds = ((acceptedGroupsRaw ?? []) as { id: string }[]).map(g => g.id)

  let sessions: any[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select(`
        *,
        groups (
          *,
          courses (name, language, level),
          profiles:teacher_id (name, avatar_url)
        )
      `)
      .in('group_id', groupIds)
      .order('scheduled_at', { ascending: false })
    sessions = data ?? []
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-400 text-sm mt-1">
            View your schedule, join live calls, and review lesson materials.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-brand-500 rounded-full" />
            <span>{sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length} Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span>{sessions.filter(s => s.status === 'completed').length} Past</span>
          </div>
        </div>
      </div>

      <StudentSessionsClient sessions={sessions} />
    </div>
  )
}

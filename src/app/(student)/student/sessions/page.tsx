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

  const groupIds = ((memberGroupsRaw ?? []) as { group_id: string }[]).map(m => m.group_id)

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Sessions</h1>
          <p className="text-gray-500 font-medium mt-1">
            View your schedule, join live calls, and review past lesson materials.
          </p>
        </div>
        <div className="flex gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-brand-500 rounded-full" />
            {sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length} Upcoming
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            {sessions.filter(s => s.status === 'completed').length} Completed
          </div>
        </div>
      </div>

      <StudentSessionsClient sessions={sessions} />
    </div>
  )
}

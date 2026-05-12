import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProposalsClient } from './ProposalsClient'

type ProposalRow = {
  id: string
  course_id: string
  proposed_at: string | null
  acceptance_status: string
  courses: { name: string; language: string; level: string; sessions_per_week: number; duration_weeks: number } | null
  group_members: Array<{ profiles: { id: string; name: string; avatar_url: string | null } | null }>
  sessions: Array<{ scheduled_at: string }>
}

export default async function TeacherProposalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rowsRaw } = await (supabase as any)
    .from('groups')
    .select(`
      id, course_id, proposed_at, acceptance_status,
      courses ( name, language, level, sessions_per_week, duration_weeks ),
      group_members ( profiles ( id, name, avatar_url ) ),
      sessions ( scheduled_at )
    `)
    .eq('teacher_id', user.id)
    .eq('acceptance_status', 'pending_teacher')
    .order('proposed_at', { ascending: false })

  const proposals = (rowsRaw ?? []) as ProposalRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Group Proposals</h1>
        <p className="text-gray-500 text-sm mt-1">
          {proposals.length === 0
            ? "You're all caught up — no proposals waiting."
            : `${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} waiting for your response.`}
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-dashed border-gray-200 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-gray-700 mb-1">No pending proposals</p>
          <p className="text-sm text-gray-400 mb-4">When admin proposes a new group for you, it&apos;ll appear here.</p>
          <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors">
            Back to dashboard →
          </Link>
        </div>
      ) : (
        <ProposalsClient proposals={proposals.map(p => ({
          id: p.id,
          courseName: p.courses?.name ?? 'Unknown course',
          courseLanguage: p.courses?.language ?? '',
          courseLevel: p.courses?.level ?? '',
          sessionsPerWeek: p.courses?.sessions_per_week ?? 0,
          durationWeeks: p.courses?.duration_weeks ?? 0,
          proposedAt: p.proposed_at,
          students: p.group_members.map(gm => gm.profiles).filter((p): p is NonNullable<typeof p> => !!p),
          sessionTimes: p.sessions.map(s => s.scheduled_at).sort(),
        }))} />
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EarningsClient } from './EarningsClient'
import type { Group, Course, Session } from '@/lib/supabase/types'

type SessionRow = Session & {
  groups: (Group & { courses: Pick<Course, 'name' | 'language'> | null }) | null
}

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get rate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tpRaw } = await (supabase as any)
    .from('profiles')
    .select('rate_per_session')
    .eq('id', user.id)
    .single()
  const rate: number = (tpRaw as { rate_per_session?: number } | null)?.rate_per_session ?? 25

  // Completed sessions
  const { data: groupsRaw } = await supabase.from('groups').select('id').eq('teacher_id', user.id)
  const groupIds = ((groupsRaw ?? []) as { id: string }[]).map(g => g.id)

  let sessions: SessionRow[] = []
  if (groupIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('sessions')
      .select('*, groups(*, courses(name, language))')
      .in('group_id', groupIds)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
    sessions = (data ?? []) as SessionRow[]
  }

  // Payout history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payoutsRaw } = await (supabase as any)
    .from('teacher_payouts')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const payouts = (payoutsRaw ?? []) as {
    id: string; amount: number; status: string; payout_date: string | null;
    method: string | null; created_at: string
  }[]

  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)

  const serializedSessions = sessions.map(s => ({
    id: s.id,
    scheduled_at: s.scheduled_at,
    duration_minutes: s.duration_minutes,
    course_name: s.groups?.courses?.name ?? 'Session',
    language: s.groups?.courses?.language ?? '',
    earned: rate,
  }))

  return (
    <EarningsClient
      sessions={serializedSessions}
      payouts={payouts}
      rate={rate}
      totalPaid={totalPaid}
    />
  )
}

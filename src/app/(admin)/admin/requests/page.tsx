import { createClient } from '@/lib/supabase/server'
import { RequestsClient } from './RequestsClient'

export default async function AdminRequestsPage() {
  const supabase = await createClient()

  // Fetch Payouts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payoutsRaw } = await (supabase as any)
    .from('teacher_payouts')
    .select('*, profiles:teacher_id(name, avatar_url)')
    .order('created_at', { ascending: false })

  // Fetch Group Action Requests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: groupActionsRaw } = await (supabase as any)
    .from('group_action_requests')
    .select('*, profiles:teacher_id(name, avatar_url), groups(courses(name))')
    .order('created_at', { ascending: false })

  const payouts = (payoutsRaw ?? []) as {
    id: string
    teacher_id: string
    amount: number
    status: 'pending' | 'processing' | 'paid' | 'failed'
    payout_date: string | null
    method: string | null
    created_at: string
    profiles?: { name?: string; avatar_url?: string | null }
  }[]

  const groupActions = (groupActionsRaw ?? []) as {
    id: string
    group_id: string
    teacher_id: string
    type: 'pause' | 'student_reassignment' | 'other'
    notes: string | null
    status: 'pending' | 'resolved' | 'rejected'
    created_at: string
    profiles?: { name?: string; avatar_url?: string | null }
    groups?: { courses?: { name?: string } }
  }[]

  return <RequestsClient payouts={payouts} groupActions={groupActions} />
}

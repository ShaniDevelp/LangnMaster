'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processPayout(payoutId: string, status: 'paid' | 'failed', adminNotes?: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify Admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Fetch payout to get teacher_id and amount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payout } = await (supabase as any)
    .from('teacher_payouts')
    .select('teacher_id, amount')
    .eq('id', payoutId)
    .single()

  if (!payout) return { error: 'Payout not found' }

  // Update Payout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase as any)
    .from('teacher_payouts')
    .update({ 
      status, 
      admin_notes: adminNotes,
      payout_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null
    })
    .eq('id', payoutId)

  if (updateErr) return { error: updateErr.message }

  // Notify Teacher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('notifications').insert({
    user_id: payout.teacher_id,
    type: status === 'paid' ? 'payout_processed' : 'payout_failed',
    payload: { amount: payout.amount, notes: adminNotes }
  })

  revalidatePath('/admin/requests')
  revalidatePath('/admin/dashboard')
  return {}
}

export async function resolveGroupAction(requestId: string, status: 'resolved' | 'rejected'): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify Admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Update Action Request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase as any)
    .from('group_action_requests')
    .update({ status })
    .eq('id', requestId)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/requests')
  revalidatePath('/admin/dashboard')
  return {}
}

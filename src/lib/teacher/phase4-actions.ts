'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── Payout request ────────────────────────────────────────────────────────────
export async function requestPayout(amount: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('teacher_payouts')
    .insert({
      teacher_id: user.id,
      amount,
      status: 'pending',
      method: 'manual',
    })

  if (error) return { error: error.message }

  // Create notification for admin (insert with null user_id workaround — notify teacher only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('notifications').insert({
    user_id: user.id,
    type: 'payout_requested',
    payload: { amount },
  })

  return {}
}

// ── Notification prefs ────────────────────────────────────────────────────────
export async function saveNotificationPrefs(prefs: Record<string, boolean>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ notification_prefs: prefs } as never)
    .eq('id', user.id)

  if (error) return { error: error.message }
  return {}
}

// ── Availability save ─────────────────────────────────────────────────────────
export async function saveAvailability(slots: string[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ availability: slots } as never)
    .eq('id', user.id)

  if (error) return { error: error.message }

  // Notify self — admin will see this in teacher management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('notifications').insert({
    user_id: user.id,
    type: 'availability_updated',
    payload: { slots_count: slots.length },
  })

  return {}
}

// ── Group action request ──────────────────────────────────────────────────────
export async function requestGroupAction(
  groupId: string,
  type: 'pause' | 'student_reassignment' | 'other',
  notes: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('group_action_requests')
    .insert({ group_id: groupId, teacher_id: user.id, type, notes })

  if (error) return { error: error.message }
  return {}
}

// ── Mark notifications read ───────────────────────────────────────────────────
export async function markNotificationsRead(ids: string[]): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (ids.length === 0) {
    // Mark all
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)
  }
}

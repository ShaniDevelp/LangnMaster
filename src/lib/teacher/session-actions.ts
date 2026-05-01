'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── Save pre-call topic / prep notes ─────────────────────────────────────────

export async function savePreCallNotes(
  sessionId: string,
  data: { topic?: string; prep_notes?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('sessions')
    .update({ topic: data.topic ?? null, prep_notes: data.prep_notes ?? null })
    .eq('id', sessionId)

  if (error) return { error: error.message }
  return {}
}

// ── Mark session as started (status = active) ─────────────────────────────────

export async function startSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('sessions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) return { error: error.message }
  return {}
}

// ── Save post-call notes + attendance ────────────────────────────────────────

type AttendanceEntry = {
  student_id: string
  status: 'present' | 'late' | 'no_show'
}

type PostCallData = {
  session_notes: string
  homework_text: string
  homework_url: string
  attendance: AttendanceEntry[]
}

export async function savePostCall(
  sessionId: string,
  groupId: string,
  data: PostCallData
): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Update session fields + mark completed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: sessErr } = await (supabase as any)
    .from('sessions')
    .update({
      session_notes: data.session_notes || null,
      homework_text: data.homework_text || null,
      homework_url:  data.homework_url  || null,
      status: 'completed',
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (sessErr) return { error: sessErr.message }

  // 2. Upsert attendance
  if (data.attendance.length > 0) {
    const rows = data.attendance.map(a => ({
      session_id: sessionId,
      student_id: a.student_id,
      status: a.status,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: attErr } = await (supabase as any)
      .from('session_attendance')
      .upsert(rows, { onConflict: 'session_id,student_id' })

    if (attErr) return { error: attErr.message }
  }

  redirect(`/teacher/groups`)
}

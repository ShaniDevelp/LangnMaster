import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyTeacherApplicationResult } from '@/lib/email/teacher-notify'

export async function POST(req: NextRequest) {
  // Verify the caller is an admin via their session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    teacherId: string
    action: 'approve' | 'reject'
    adminNotes?: string
    noApplication?: boolean
  }
  const { teacherId, action, adminNotes, noApplication } = body

  if (!teacherId || !action) {
    return NextResponse.json({ error: 'Missing teacherId or action' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (noApplication && action === 'approve') {
    // No application row exists — upsert one directly as approved (admin override)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertErr } = await (admin as any)
      .from('teacher_applications')
      .upsert(
        {
          user_id: teacherId,
          languages_taught: [],
          certifications: [],
          status: 'approved',
          admin_notes: adminNotes ?? 'Admin override — approved without application',
          reviewed_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }
  } else {
    // Normal flow — update existing application row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: appErr } = await (admin as any)
      .from('teacher_applications')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', teacherId)

    if (appErr) {
      return NextResponse.json({ error: appErr.message }, { status: 500 })
    }
  }

  const approved = action === 'approve'

  // On approval, carry the application data onto the public profile and mark
  // onboarding_completed = true — teacher lands straight on their dashboard,
  // no separate post-approval wizard.
  if (approved) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: app } = await (admin as any)
      .from('teacher_applications')
      .select('languages_taught, certifications, teaching_bio, intro_video_url, timezone, availability')
      .eq('user_id', teacherId)
      .maybeSingle()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('profiles')
      .update({
        onboarding_completed: true,
        timezone: app?.timezone ?? null,
        availability: app?.availability ?? [],
        languages_taught: app?.languages_taught ?? [],
        certifications: app?.certifications ?? [],
        intro_video_url: app?.intro_video_url ?? null,
        bio: app?.teaching_bio ?? null,
      })
      .eq('id', teacherId)
  }

  // Email the teacher with the approve/reject result. Awaited so it actually
  // sends before the response (the notify fn is self-contained + non-throwing).
  await notifyTeacherApplicationResult({ teacherId, approved, adminNotes })

  return NextResponse.json({ ok: true })
}

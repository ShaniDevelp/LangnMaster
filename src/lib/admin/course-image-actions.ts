'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const BUCKET = 'course-images'

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role: string } | null)?.role !== 'admin') return { ok: false, error: 'Unauthorized' }
  return { ok: true }
}

// Signed upload URL for a course banner image. Admin-only. Returns the public
// URL too so the form can set thumbnail_url immediately after the upload.
export async function getCourseImageUploadUrl(
  fileName: string,
): Promise<{ token: string; path: string; publicUrl: string } | { error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `courses/${Date.now()}-${safe}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return { error: error?.message ?? 'Failed to create upload URL' }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { token: data.token, path, publicUrl: pub.publicUrl }
}

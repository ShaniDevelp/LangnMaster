'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const BUCKET = 'avatars'

// Create a signed upload URL for the current user's new avatar. The path is
// prefixed with the user id so each user owns their own folder.
export async function getAvatarUploadUrl(
  fileName: string,
): Promise<{ token: string; path: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${user.id}/${Date.now()}-${safe}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return { error: error?.message ?? 'Failed to create upload URL' }

  return { token: data.token, path }
}

// Persist the uploaded avatar's public URL onto the user's profile.
export async function saveAvatar(
  path: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  const url = pub.publicUrl

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('profiles').update({ avatar_url: url } as any).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/student/profile')
  revalidatePath('/teacher/profile')
  return { url }
}

// Remove the current user's avatar (revert to initials).
export async function clearAvatar(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('profiles').update({ avatar_url: null } as any).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/student/profile')
  revalidatePath('/teacher/profile')
  return {}
}

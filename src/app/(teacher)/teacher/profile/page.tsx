import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import type { Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRaw as any

  return (
    <ProfileClient
      userId={user.id}
      profile={{
        name:              profile?.name ?? '',
        bio:               profile?.bio ?? null,
        timezone:          profile?.timezone ?? null,
        intro_video_url:   profile?.intro_video_url ?? null,
        years_experience:  profile?.years_experience ?? 0,
        certifications:    profile?.certifications ?? [],
        languages_taught:  (profile?.languages_taught as { lang: string; proficiency: string }[]) ?? [],
        rate_per_session:  profile?.rate_per_session ?? 25,
        rating:            profile?.rating ?? 0,
        review_count:      profile?.review_count ?? 0,
        availability:      (profile?.availability as string[]) ?? [],
        notification_prefs: (profile?.notification_prefs as Record<string, boolean>) ?? {},
      }}
    />
  )
}

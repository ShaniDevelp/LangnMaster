import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import type { Profile } from '@/lib/supabase/types'

export default async function TeacherProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as (Profile & { notification_prefs?: Record<string, boolean> | null }) | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tpRaw } = await (supabase as any)
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const tp = (tpRaw ?? {}) as {
    intro_video_url?: string | null
    years_experience?: number
    certifications?: string[]
    languages_taught?: { lang: string; proficiency: string }[]
    rating?: number
    review_count?: number
    rate_per_session?: number
  }

  return (
    <ProfileClient
      userId={user.id}
      profile={{
        name:              profile?.name ?? '',
        bio:               profile?.bio ?? null,
        timezone:          profile?.timezone ?? null,
        intro_video_url:   tp.intro_video_url ?? null,
        years_experience:  tp.years_experience ?? 0,
        certifications:    tp.certifications ?? [],
        languages_taught:  (tp.languages_taught as { lang: string; proficiency: string }[]) ?? [],
        rate_per_session:  tp.rate_per_session ?? 25,
        rating:            tp.rating ?? 0,
        review_count:      tp.review_count ?? 0,
        availability:      (profile?.availability as string[]) ?? [],
        notification_prefs: (profile?.notification_prefs as Record<string, boolean>) ?? {},
      }}
    />
  )
}

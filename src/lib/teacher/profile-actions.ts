'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveTeacherProfile(data: {
  name: string
  bio: string
  timezone: string
  introVideoUrl: string
  yearsExp: number
  certs: string[]
  languages: { lang: string; proficiency: string }[]
  rate: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Update profiles table
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ name: data.name, bio: data.bio || null, timezone: data.timezone || null })
    .eq('id', user.id)

  if (profileErr) return { error: profileErr.message }

  // Update teacher_profiles (upsert)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: tpErr } = await (supabase as any)
    .from('teacher_profiles')
    .upsert({
      user_id: user.id,
      intro_video_url: data.introVideoUrl || null,
      years_experience: data.yearsExp,
      certifications: data.certs,
      languages_taught: data.languages,
      rate_per_session: data.rate,
    }, { onConflict: 'user_id' })

  if (tpErr) return { error: tpErr.message }
  return {}
}

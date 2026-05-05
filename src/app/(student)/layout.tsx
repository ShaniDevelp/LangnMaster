import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/SidebarNav'
import { StudentLayoutClient } from '@/components/StudentLayoutClient'
import type { Profile } from '@/lib/supabase/types'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const user = session.user

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profile = profileRaw as Profile | null
  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name: user.user_metadata?.name ?? user.email ?? 'Student', role: 'student' as const })
      .select()
      .single()
    profile = created as Profile | null
  }

  if (!profile) redirect('/login')

  const p = profile as Profile & { onboarding_completed?: boolean | null }
  if (!p.onboarding_completed) redirect('/student/onboarding')

  return (
    <StudentLayoutClient profile={profile!}>
      {children}
    </StudentLayoutClient>
  )
}

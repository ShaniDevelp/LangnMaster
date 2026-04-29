import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/SidebarNav'
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
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav profile={profile!} />

      {/* Content — offset by sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 max-w-7xl w-full mx-auto lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import type { Profile } from '@/lib/supabase/types'

const studentNav = [
  { href: '/student/dashboard', icon: '🏠', label: 'Home' },
  { href: '/student/courses', icon: '📚', label: 'Courses' },
  { href: '/student/sessions', icon: '📅', label: 'Sessions' },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // getSession() reads cookie, no network call for valid tokens.
  // On expired+unrefreshable session, Supabase SSR clears cookies → proxy won't bounce.
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBar profile={profile!} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>
      <BottomNav items={studentNav} />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'

const teacherNav = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/teacher/courses',   icon: '🎓', label: 'Courses'   },
  { href: '/teacher/schedule',  icon: '📅', label: 'Schedule'  },
  { href: '/teacher/groups',    icon: '👥', label: 'Groups'    },
  { href: '/teacher/sessions',  icon: '🎥', label: 'Sessions'  },
  { href: '/teacher/profile',   icon: '👤', label: 'Profile'   },
]

const sidebarExtras = [
  { href: '/teacher/earnings',       icon: '💰', label: 'Earnings' },
  { href: '/teacher/notifications',  icon: '🔔', label: 'Notifications' },
]

// Routes that should render without the full sidebar (gated states)
const GATED_PATHS = ['/teacher/application', '/teacher/pending', '/teacher/onboarding']

// Simple shell layout for gated state pages (no sidebar nav)
function GatedShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: { name: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      {/* Minimal header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <span className="text-lg font-bold text-[#6c4ff5]">LangMaster</span>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 hidden sm:block">{profile.name}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Content — centered */}
      <main className="flex-1 flex items-start justify-center px-4 py-10 lg:py-16">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      .upsert({
        id: user.id,
        name: user.user_metadata?.name ?? user.email ?? 'Teacher',
        role: 'teacher' as const,
      })
      .select()
      .single()
    profile = created as Profile | null
  }

  if (!profile) redirect('/login')

  // Check application + onboarding state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app } = await (supabase as any)
    .from('teacher_applications')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const appStatus = (app as { status: string } | null)?.status ?? 'none'
  const isApproved = appStatus === 'approved'
  const onboardingCompleted =
    (profile as Profile & { onboarding_completed?: boolean }).onboarding_completed ?? false

  const isGated = !isApproved || !onboardingCompleted

  // Gated state: render the minimal shell (middleware already ensures
  // the user is on the correct gated page)
  if (isGated) {
    return (
      <GatedShell profile={profile}>
        {children}
      </GatedShell>
    )
  }

  // Fully unlocked: fetch notification count + pending group proposals + render full sidebar
  const [{ count: unreadCount }, { count: proposalCountRaw }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('groups')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
      .eq('acceptance_status', 'pending_teacher'),
  ])

  const unread: number = unreadCount ?? 0
  const proposalCount: number = proposalCountRaw ?? 0

  return (
    <TeacherLayoutClient profile={profile!} unread={unread} proposalCount={proposalCount}>
      {children}
    </TeacherLayoutClient>
  )
}

import { TeacherLayoutClient } from '@/components/TeacherLayoutClient'

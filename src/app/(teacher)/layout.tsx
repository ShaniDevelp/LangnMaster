import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { BayyanLogo } from '@/components/BayyanLogo'
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
        <BayyanLogo size={28} />
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

      {/* Content — page controls its own max-width / centering */}
      <main className="flex-1 w-full">
        {children}
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

  // Check application state via admin (keyed by verified user.id). RLS reads can
  // come back empty right after a login redirect, which would wrongly gate an
  // already-submitted teacher back into the application wizard.
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app } = await (admin as any)
    .from('teacher_applications')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const appStatus = (app as { status: string } | null)?.status ?? 'none'
  const isApproved = appStatus === 'approved'

  // Approval is the only gate. Onboarding now lives inside the application —
  // no separate post-approval wizard.
  const isGated = !isApproved

  // The application wizard renders its own full-screen self-contained design
  // with an in-page top bar — same as the student onboarding. It must NOT get
  // the GatedShell header (would double up the top bar on desktop). Only the
  // pending/rejected status page needs GatedShell for a header + container.
  //   appStatus 'none'      → /teacher/application  (full-bleed)
  //   pending / rejected    → /teacher/pending      (GatedShell)
  const isWizard = appStatus === 'none'

  if (isGated) {
    if (isWizard) {
      // Page owns the full screen — no topbar until onboarding completes.
      return <>{children}</>
    }
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

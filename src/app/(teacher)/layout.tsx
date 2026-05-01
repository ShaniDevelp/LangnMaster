import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'

const teacherNav = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/teacher/schedule',  icon: '📅', label: 'Schedule'  },
  { href: '/teacher/groups',    icon: '👥', label: 'Groups'    },
  { href: '/teacher/sessions',  icon: '🎥', label: 'History'   },
  { href: '/teacher/profile',   icon: '👤', label: 'Profile'   },
]

// Sidebar-only extras (not in mobile bottom nav, which is limited to 5)
const sidebarExtras = [
  { href: '/teacher/earnings',       icon: '💰', label: 'Earnings' },
  { href: '/teacher/notifications',  icon: '🔔', label: 'Notifications' },
]

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const user = session.user
  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  let profile = profileRaw as Profile | null

  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name: user.user_metadata?.name ?? user.email ?? 'Teacher', role: 'teacher' as const })
      .select().single()
    profile = created as Profile | null
  }

  if (!profile) redirect('/login')

  // Unread notification count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: unreadCount } = await (supabase as any)
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  const unread: number = unreadCount ?? 0

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-[#6c4ff5]">LangMaster</span>
          <span className="ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Teacher</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* Main nav */}
          {teacherNav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#6c4ff5] transition-colors">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-gray-100" />

          {/* Extras */}
          {sidebarExtras.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#6c4ff5] transition-colors">
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.href.includes('notifications') && unread > 0 && (
                <span className="ml-auto text-xs font-bold bg-[#6c4ff5] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {profile!.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile!.name}</p>
              <p className="text-xs text-gray-400">Teacher</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="w-full text-xs text-gray-500 hover:text-gray-700 text-left py-1 transition-colors">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-[#6c4ff5]">LangMaster</span>
            <div className="flex items-center gap-3">
              {/* Notification bell on mobile */}
              <Link href="/teacher/notifications" className="relative">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6c4ff5] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {profile!.name.charAt(0).toUpperCase()}
              </div>
              <form action={signOut}>
                <button type="submit" className="text-xs text-gray-400">Sign out</button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom nav (5 main items only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100 pb-safe z-40">
          <div className="flex justify-around h-16 items-center px-2">
            {teacherNav.map(item => (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-[#6c4ff5] transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

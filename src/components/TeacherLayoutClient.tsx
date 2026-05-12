'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'
import { UnreadMessagesBadge } from '@/components/chat/UnreadMessagesBadge'

const teacherNav = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/teacher/courses',   icon: '🎓', label: 'Courses'   },
  { href: '/teacher/schedule',  icon: '📅', label: 'Schedule'  },
  { href: '/teacher/groups',    icon: '👥', label: 'Groups'    },
  { href: '/teacher/sessions',  icon: '🎥', label: 'Sessions'  },
  { href: '/teacher/profile',   icon: '👤', label: 'Profile'   },
]

const sidebarExtras = [
  { href: '/teacher/messages',      icon: '💬', label: 'Messages',      badge: 'messages' },
  { href: '/teacher/proposals',     icon: '📨', label: 'Proposals',     badge: 'proposals' },
  { href: '/teacher/earnings',      icon: '💰', label: 'Earnings',      badge: null },
  { href: '/teacher/notifications', icon: '🔔', label: 'Notifications', badge: 'notifications' },
]

// Bottom nav: 4 primary + "More" toggle
const bottomNav = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'Home' },
  { href: '/teacher/sessions',  icon: '🎥', label: 'Sessions' },
  { href: '/teacher/messages',  icon: '💬', label: 'Messages', badge: true },
  { href: '/teacher/groups',    icon: '👥', label: 'Groups' },
]

// Drawer items = everything not in bottomNav
const drawerNav = [
  { href: '/teacher/courses',       icon: '🎓', label: 'Courses',      badge: null },
  { href: '/teacher/schedule',      icon: '📅', label: 'Schedule',     badge: null },
  { href: '/teacher/proposals',     icon: '📨', label: 'Proposals',    badge: 'proposals' as const },
  { href: '/teacher/earnings',      icon: '💰', label: 'Earnings',     badge: null },
  { href: '/teacher/notifications', icon: '🔔', label: 'Notifications', badge: null },
  { href: '/teacher/profile',       icon: '👤', label: 'Profile',      badge: null },
]

export function TeacherLayoutClient({
  children,
  profile,
  unread,
  proposalCount,
}: {
  children: React.ReactNode
  profile: Profile
  unread: number
  proposalCount: number
}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isSession  = pathname?.includes('/teacher/session/')
  const isMessages = pathname?.includes('/teacher/messages')

  if (isSession) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <main className="min-h-screen w-full">{children}</main>
      </div>
    )
  }

  return (
    <div className={`flex bg-gray-50 ${isMessages ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}>

      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 z-40">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-[#6c4ff5]">LangMaster</span>
          <span className="ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Teacher</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {teacherNav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-purple-50 text-[#6c4ff5]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#6c4ff5]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          <div className="my-2 border-t border-gray-100" />

          {sidebarExtras.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-purple-50 text-[#6c4ff5]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#6c4ff5]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {item.badge === 'notifications' && unread > 0 && (
                  <span className="ml-auto text-xs font-bold bg-[#6c4ff5] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
                {item.badge === 'proposals' && proposalCount > 0 && (
                  <span className="ml-auto text-xs font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {proposalCount > 99 ? '99+' : proposalCount}
                  </span>
                )}
                {item.badge === 'messages' && !active && (
                  <UnreadMessagesBadge userId={profile.id} />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
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

      {/* ── Main content ───────────────────────────────────────── */}
      <div className={`flex-1 lg:ml-60 flex flex-col ${isMessages ? 'overflow-hidden' : ''}`}>

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-[#6c4ff5]">LangMaster</span>
            <div className="flex items-center gap-3">
              <Link href="/teacher/notifications" className="relative">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6c4ff5] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className={isMessages
          ? 'flex-1 overflow-hidden'
          : 'flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto'
        }>
          {children}
        </main>

        {/* ── Mobile bottom nav ──────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-t border-gray-100 pb-safe">
          <div className="flex items-center h-16 px-1">
            {bottomNav.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                    active ? 'text-[#6c4ff5]' : 'text-gray-400'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
                  {item.badge && !active && (
                    <span className="absolute top-1 right-1/2 translate-x-4">
                      <UnreadMessagesBadge userId={profile.id} dot />
                    </span>
                  )}
                </Link>
              )
            })}

            {/* More button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                drawerOpen ? 'text-[#6c4ff5]' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">☰</span>
              <span className="text-[9px] font-bold uppercase tracking-tight">More</span>
            </button>
          </div>
        </nav>

        {/* ── More drawer ────────────────────────────────────── */}
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/30"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Sheet */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl pb-safe">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c4ff5] to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-400">Teacher</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 p-4">
                {drawerNav.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  const showProposalsBadge = item.badge === 'proposals' && proposalCount > 0
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`relative flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-colors ${
                        active ? 'bg-purple-50 text-[#6c4ff5]' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-medium">{item.label}</span>
                      {showProposalsBadge && (
                        <span className="absolute top-2 right-3 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {proposalCount > 9 ? '9+' : proposalCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="px-4 pb-4">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-red-50 text-red-500 text-sm font-semibold transition-colors hover:bg-red-100"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

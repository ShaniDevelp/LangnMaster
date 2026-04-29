'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'

const NAV = [
  { href: '/student/dashboard', icon: '🏠', label: 'Home' },
  { href: '/student/courses',   icon: '📚', label: 'Courses' },
  { href: '/student/sessions',  icon: '📅', label: 'Sessions' },
  { href: '/student/profile',   icon: '👤', label: 'Profile' },
]

export function SidebarNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/student/dashboard" className="text-xl font-bold text-brand-500">
            LangMaster
          </Link>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">Student Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-5 w-1 rounded-full bg-brand-500" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/student/profile"
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Avatar name={profile.name} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left text-xs text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/student/dashboard" className="text-lg font-bold text-brand-500">
            LangMaster
          </Link>
          <Link href="/student/profile">
            <Avatar name={profile.name} />
          </Link>
        </div>
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-gray-100 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                  active ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-medium ${active ? 'text-brand-500' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

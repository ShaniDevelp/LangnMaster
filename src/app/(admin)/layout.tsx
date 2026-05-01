import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOutAdmin } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'

const adminNav = [
  { href: '/admin/dashboard', icon: '📊', label: 'Overview' },
  { href: '/admin/enrollments', icon: '📋', label: 'Enrollments' },
  { href: '/admin/students', icon: '🎓', label: 'Students' },
  { href: '/admin/teachers', icon: '👨‍🏫', label: 'Teachers' },
  { href: '/admin/groups', icon: '👥', label: 'Groups' },
  { href: '/admin/requests', icon: '⚙️', label: 'Requests' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  const user = session.user

  const { data: profileRaw } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const profile = profileRaw as Profile | null
  if (!profile || profile.role !== 'admin') redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-[#6c4ff5]">LangMaster</span>
          <span className="ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map(item => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <form action={signOutAdmin}>
            <button type="submit" className="w-full text-xs text-gray-500 hover:text-gray-700 text-left py-1">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-[#6c4ff5]">LangMaster Admin</span>
          <form action={signOutAdmin}>
            <button type="submit" className="text-xs text-gray-400">Sign out</button>
          </form>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-gray-100 pb-safe">
          <div className="flex justify-around h-16 items-center px-1">
            {adminNav.map(item => (
              <AdminNavLink key={item.href} {...item} mobile />
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

function AdminNavLink({ href, icon, label, mobile }: { href: string; icon: string; label: string; mobile?: boolean }) {
  if (mobile) {
    return (
      <Link href={href} className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-400 hover:text-[#6c4ff5]">
        <span className="text-lg">{icon}</span>
        <span className="text-xs">{label}</span>
      </Link>
    )
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#6c4ff5] transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

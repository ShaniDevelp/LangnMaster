'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SidebarNav } from '@/components/SidebarNav'
import { UnreadMessagesBadge } from '@/components/chat/UnreadMessagesBadge'
import type { Profile } from '@/lib/supabase/types'

export function StudentLayoutClient({
  children,
  profile
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const pathname = usePathname()
  const isSession = pathname?.includes('/student/session/')
  const isMessages = pathname?.includes('/student/messages')

  if (isSession) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className={`flex bg-gray-50 ${isMessages ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}>
      <SidebarNav profile={profile} />

      <div className={`flex-1 flex flex-col lg:ml-64 ${isMessages ? 'overflow-hidden' : 'min-h-screen'}`}>

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-brand-500">LangMaster</span>
            <div className="flex items-center gap-3">
              <Link href="/student/messages" className="relative">
                <span className="text-lg">💬</span>
                <span className="absolute -top-1 -right-1">
                  <UnreadMessagesBadge userId={profile.id} dot />
                </span>
              </Link>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className={isMessages
          ? 'flex-1 overflow-hidden'
          : 'flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 max-w-7xl w-full mx-auto lg:mx-0'
        }>
          {children}
        </main>
      </div>
    </div>
  )
}

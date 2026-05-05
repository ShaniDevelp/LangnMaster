'use client'
import { usePathname } from 'next/navigation'
import { SidebarNav } from '@/components/SidebarNav'
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
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav profile={profile} />

      {/* Content — offset by sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 max-w-7xl w-full mx-auto lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  )
}

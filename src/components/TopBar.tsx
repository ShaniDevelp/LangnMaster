import Link from 'next/link'
import { signOut } from '@/lib/auth/actions'
import type { Profile } from '@/lib/supabase/types'

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#6c4ff5]">LangMaster</Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{profile.name}</span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signInAdmin } from '@/lib/auth/actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signInAdmin(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 gap-3">
          <span className="text-2xl font-bold text-white">LangMaster</span>
          <span className="text-xs font-semibold bg-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/40">
            Admin
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin sign in</h1>
          <p className="text-gray-400 text-sm mb-8">Access the LangMaster admin panel</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password" name="password" type="password" required autoComplete="current-password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={isPending}
              className="w-full bg-purple-600 text-white font-semibold py-3.5 rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not an admin?{' '}
            <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300">
              Go to regular login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

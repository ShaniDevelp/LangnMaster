'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BayyanLogo } from '@/components/BayyanLogo'
import { requestPasswordReset } from '@/lib/auth/actions'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    startTransition(async () => {
      await requestPasswordReset(clean)
      // Always advance — we never reveal whether the email exists.
      router.push(`/reset-password?email=${encodeURIComponent(clean)}`)
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BayyanLogo size={34} />
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter your account email and we&apos;ll send you a 6-digit reset code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit" disabled={isPending}
              className="w-full bg-[#6c4ff5] text-white font-semibold py-3.5 rounded-xl hover:bg-[#5c3de8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Sending…' : 'Send reset code'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered it?{' '}
            <Link href="/login" className="font-semibold text-[#6c4ff5] hover:text-[#5c3de8]">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

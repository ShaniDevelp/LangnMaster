'use client'
import { Suspense, useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { BayyanLogo } from '@/components/BayyanLogo'
import { OtpInput } from '@/components/OtpInput'
import { resetPassword, requestPasswordReset } from '@/lib/auth/actions'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const code = digits.join('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (code.length !== CODE_LENGTH) { setError('Enter the 6-digit code.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    const fd = new FormData()
    fd.set('email', email)
    fd.set('code', code)
    fd.set('password', password)
    startTransition(async () => {
      const res = await resetPassword(fd)
      if (res?.error) {
        setError(res.error)
        setDigits(Array(CODE_LENGTH).fill(''))
      } else {
        router.push('/login?reset=1')
      }
    })
  }

  function resend() {
    if (cooldown > 0) return
    setError(null)
    startTransition(async () => {
      await requestPasswordReset(email)
      setNotice('If the account exists, a new code is on its way.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter the code sent to{' '}
        <span className="font-semibold text-gray-700">{email || 'your email'}</span> and choose a
        new password.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl">
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reset code</label>
          <OtpInput digits={digits} setDigits={setDigits} disabled={isPending} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <input
            id="password" type="password" required autoComplete="new-password" minLength={6}
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            placeholder="Min. 6 characters"
          />
        </div>

        <button
          type="submit" disabled={isPending}
          className="w-full bg-[#6c4ff5] text-white font-semibold py-3.5 rounded-xl hover:bg-[#5c3de8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Updating…' : 'Reset password'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-6">
        Didn&apos;t get a code?{' '}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || isPending}
          className="font-semibold text-[#6c4ff5] hover:text-[#5c3de8] disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${fmt(cooldown)}` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BayyanLogo size={34} />
        </Link>
        <Suspense fallback={<div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8 text-center text-gray-400">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}

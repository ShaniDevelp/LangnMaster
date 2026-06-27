'use client'
import { Suspense, useState, useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BayyanLogo } from '@/components/BayyanLogo'
import { verifyEmailCode, resendVerificationCode } from '@/lib/auth/actions'

// Mirror of the server values in src/lib/auth/otp.ts.
const CODE_TTL_SECONDS = 10 * 60
const RESEND_COOLDOWN_SECONDS = 60
const CODE_LENGTH = 6

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function VerifyForm() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [expiresIn, setExpiresIn] = useState(CODE_TTL_SECONDS)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Expiry countdown
  useEffect(() => {
    if (expiresIn <= 0) return
    const t = setInterval(() => setExpiresIn(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [expiresIn])

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const code = digits.join('')
  const expired = expiresIn <= 0

  const submit = useCallback(
    (value: string) => {
      setError(null)
      const fd = new FormData()
      fd.set('email', email)
      fd.set('code', value)
      startTransition(async () => {
        const res = await verifyEmailCode(fd)
        if (res?.error) {
          setError(res.error)
          setDigits(Array(CODE_LENGTH).fill(''))
          inputs.current[0]?.focus()
        }
        // success → server action redirects
      })
    },
    [email],
  )

  function setDigit(i: number, val: string) {
    const clean = val.replace(/\D/g, '')
    if (!clean) {
      setDigits(d => d.map((x, idx) => (idx === i ? '' : x)))
      return
    }
    // Handle paste of a full code into one box
    if (clean.length > 1) {
      const next = clean.slice(0, CODE_LENGTH).split('')
      const filled = Array(CODE_LENGTH).fill('').map((_, idx) => next[idx] ?? '')
      setDigits(filled)
      const last = Math.min(next.length, CODE_LENGTH) - 1
      inputs.current[last]?.focus()
      if (next.length >= CODE_LENGTH) submit(filled.join(''))
      return
    }
    const d = digits.slice()
    d[i] = clean
    setDigits(d)
    if (i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
    if (d.every(x => x) && d.join('').length === CODE_LENGTH) submit(d.join(''))
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function resend() {
    if (cooldown > 0) return
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const res = await resendVerificationCode(email)
      if (res?.error) {
        setError(res.error)
        if (res.cooldownSeconds) setCooldown(res.cooldownSeconds)
      } else {
        setNotice('A new code is on its way.')
        setExpiresIn(CODE_TTL_SECONDS)
        setCooldown(RESEND_COOLDOWN_SECONDS)
        setDigits(Array(CODE_LENGTH).fill(''))
        inputs.current[0]?.focus()
      }
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
      <p className="text-gray-500 text-sm mb-6">
        We sent a {CODE_LENGTH}-digit code to{' '}
        <span className="font-semibold text-gray-700">{email || 'your email'}</span>. Enter it
        below to verify your account.
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

      <div className="flex justify-between gap-2 mb-4" onPaste={e => {
        const text = e.clipboardData.getData('text')
        if (/\d/.test(text)) { e.preventDefault(); setDigit(0, text) }
      }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el }}
            value={d}
            onChange={e => setDigit(i, e.target.value)}
            onKeyDown={e => onKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={isPending || expired}
            autoFocus={i === 0}
            className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        ))}
      </div>

      <div className="text-center text-sm mb-5">
        {expired ? (
          <span className="text-red-500">Code expired — request a new one.</span>
        ) : (
          <span className="text-gray-400">Code expires in {fmt(expiresIn)}</span>
        )}
      </div>

      <button
        onClick={() => submit(code)}
        disabled={isPending || expired || code.length !== CODE_LENGTH}
        className="w-full bg-[#6c4ff5] text-white font-semibold py-3.5 rounded-xl hover:bg-[#5c3de8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Verifying…' : 'Verify email'}
      </button>

      <div className="text-center text-sm text-gray-500 mt-6">
        Didn&apos;t get it?{' '}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || isPending}
          className="font-semibold text-[#6c4ff5] hover:text-[#5c3de8] disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${fmt(cooldown)}` : 'Resend code'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-400 mt-3">
        Wrong email?{' '}
        <Link href="/register" className="font-semibold text-[#6c4ff5] hover:text-[#5c3de8]">
          Start over
        </Link>
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BayyanLogo size={34} />
        </Link>
        <Suspense fallback={<div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8 text-center text-gray-400">Loading…</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  )
}
